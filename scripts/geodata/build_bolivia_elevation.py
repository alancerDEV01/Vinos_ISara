"""Build a compact Bolivia elevation texture from AWS Open Data Terrarium tiles."""

from io import BytesIO
import json
from math import asinh, floor, pi, tan
from pathlib import Path
from urllib.request import urlopen

import numpy as np
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFilter


WEST, EAST = -69.75, -57.35
NORTH, SOUTH = -9.55, -22.95
ZOOM = 8
WIDTH, HEIGHT = 1600, 1730
MAX_ELEVATION_METERS = 7000
OUTPUT = Path(__file__).parents[2] / "apps/web/public/data/bolivia-elevation.png"
COLOR_OUTPUT = OUTPUT.with_name("bolivia-terrain-color.png")
MASK_OUTPUT = OUTPUT.with_name("bolivia-terrain-mask.png")
NORMAL_OUTPUT = OUTPUT.with_name("bolivia-terrain-normal.jpg")
SATELLITE_OUTPUT = OUTPUT.with_name("bolivia-satellite.jpg")
GEOJSON = OUTPUT.with_name("bolivia-departments.geojson")


def world_pixel(longitude: float, latitude: float) -> tuple[float, float]:
    scale = (2**ZOOM) * 256
    x = (longitude + 180) / 360 * scale
    latitude_radians = latitude * pi / 180
    y = (1 - asinh(tan(latitude_radians)) / pi) / 2 * scale
    return x, y


def terrarium_elevation(pixel: tuple[int, int, int]) -> float:
    red, green, blue = pixel
    return red * 256 + green + blue / 256 - 32768


def main() -> None:
    north_west = world_pixel(WEST, NORTH)
    south_east = world_pixel(EAST, SOUTH)
    min_tile_x = floor(north_west[0] / 256)
    max_tile_x = floor(south_east[0] / 256)
    min_tile_y = floor(north_west[1] / 256)
    max_tile_y = floor(south_east[1] / 256)
    tiles: dict[tuple[int, int], Image.Image] = {}

    for tile_y in range(min_tile_y, max_tile_y + 1):
        for tile_x in range(min_tile_x, max_tile_x + 1):
            url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{tile_x}/{tile_y}.png"
            with urlopen(url) as response:
                tiles[(tile_x, tile_y)] = Image.open(BytesIO(response.read())).convert("RGB")

    heightmap = Image.new("L", (WIDTH, HEIGHT))
    output_pixels = heightmap.load()
    for output_y in range(HEIGHT):
        latitude = NORTH + (SOUTH - NORTH) * output_y / (HEIGHT - 1)
        for output_x in range(WIDTH):
            longitude = WEST + (EAST - WEST) * output_x / (WIDTH - 1)
            world_x, world_y = world_pixel(longitude, latitude)
            tile_x, tile_y = floor(world_x / 256), floor(world_y / 256)
            pixel_x, pixel_y = floor(world_x) % 256, floor(world_y) % 256
            elevation = max(0, min(MAX_ELEVATION_METERS, terrarium_elevation(tiles[(tile_x, tile_y)].getpixel((pixel_x, pixel_y)))))
            output_pixels[output_x, output_y] = round(elevation / MAX_ELEVATION_METERS * 255)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    heightmap.save(OUTPUT, optimize=True)

    elevation = np.asarray(heightmap, dtype=np.float32) / 255
    stops = [
        (0.00, np.array([35, 75, 46])),
        (0.12, np.array([58, 101, 57])),
        (0.28, np.array([102, 116, 66])),
        (0.48, np.array([151, 128, 82])),
        (0.67, np.array([181, 157, 108])),
        (0.82, np.array([148, 142, 128])),
        (1.00, np.array([232, 232, 224])),
    ]
    terrain = np.zeros((HEIGHT, WIDTH, 3), dtype=np.float32)
    for (low_value, low_color), (high_value, high_color) in zip(stops, stops[1:]):
        selection = (elevation >= low_value) & (elevation <= high_value)
        amount = np.clip((elevation - low_value) / (high_value - low_value), 0, 1)[..., None]
        blended = low_color + (high_color - low_color) * amount
        terrain[selection] = blended[selection]
    gradient_y, gradient_x = np.gradient(elevation)
    hillshade = np.clip(0.86 + (-gradient_x * 6 - gradient_y * 4), 0.62, 1.18)[..., None]
    Image.fromarray(np.uint8(np.clip(terrain * hillshade, 0, 255)), "RGB").save(COLOR_OUTPUT, optimize=True)

    normal_x = -gradient_x * 18
    normal_y = gradient_y * 18
    normal_z = np.ones_like(elevation)
    normal_length = np.sqrt(normal_x**2 + normal_y**2 + normal_z**2)
    normals = np.stack(
        (normal_x / normal_length, normal_y / normal_length, normal_z / normal_length),
        axis=-1,
    )
    Image.fromarray(np.uint8(np.clip((normals * 0.5 + 0.5) * 255, 0, 255)), "RGB").save(
        NORMAL_OUTPUT,
        quality=90,
        optimize=True,
        progressive=True,
    )

    with GEOJSON.open(encoding="utf-8") as source:
        collection = json.load(source)
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(mask)

    def pixel(point: list[float]) -> tuple[int, int]:
        longitude, latitude = point
        return (
            round((longitude - WEST) / (EAST - WEST) * (WIDTH - 1)),
            round((NORTH - latitude) / (NORTH - SOUTH) * (HEIGHT - 1)),
        )

    for feature in collection["features"]:
        geometry = feature["geometry"]
        polygons = [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]
        for polygon in polygons:
            draw.polygon([pixel(point) for point in polygon[0]], fill=255)
    # Department source polygons leave lakes, salars and narrow topology seams
    # as gaps. Seal the seams first, then fill every enclosed gap so water can
    # be rendered later as a surface instead of cutting through the terrain.
    sealed_mask = mask.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    ImageDraw.floodfill(sealed_mask, (0, 0), 128)
    mask_values = np.asarray(sealed_mask).copy()
    mask_values[mask_values == 0] = 255
    mask_values[mask_values == 128] = 0
    mask = Image.fromarray(mask_values, "L")
    mask.save(MASK_OUTPUT, optimize=True)

    satellite_url = (
        "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?"
        "service=WMS&request=GetMap&version=1.1.1&layers=BlueMarble_NextGeneration"
        "&styles=&format=image/jpeg&srs=EPSG:4326"
        f"&bbox={WEST},{SOUTH},{EAST},{NORTH}&width={WIDTH}&height={HEIGHT}"
    )
    with urlopen(satellite_url) as response:
        SATELLITE_OUTPUT.write_bytes(response.read())
    print(f"Wrote terrain assets ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
