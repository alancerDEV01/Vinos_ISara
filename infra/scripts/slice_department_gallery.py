from pathlib import Path
from PIL import Image

SOURCES = {
    "beni": "exec-4d3188cb-6549-41b3-b868-d3c76e3e7bbb.png",
    "chuquisaca": "exec-ff4f9cbe-2e08-4be3-b126-df90307c3ffe.png",
    "cochabamba": "exec-fbc1d363-0a6f-4679-9171-31d5f86486e9.png",
    "la-paz": "exec-929d9b14-bcb9-4dbc-b29b-63602d1bc939.png",
    "oruro": "exec-68c5d151-0c65-45af-b2a6-6ef24320104e.png",
    "pando": "exec-77064a33-453d-4243-b2da-230aa4e01120.png",
    "potosi": "exec-7f40a11f-b218-4be1-ae96-9f418b96563f.png",
    "santa-cruz": "exec-e30b07e3-1bfb-4530-ab28-fd7ec9dd3995.png",
    "tarija": "exec-aebdb059-90c3-45ee-a6c6-e3d87ccca78a.png",
}

generated = Path.home() / ".codex" / "generated_images" / "01a02788-f29b-7be1-815a-650ab47b42ab"
output = Path(__file__).resolve().parents[2] / "apps" / "web" / "public" / "images" / "departments" / "gallery"

for department, filename in SOURCES.items():
    image = Image.open(generated / filename).convert("RGB")
    width, height = image.size
    target = output / department
    target.mkdir(parents=True, exist_ok=True)
    for index in range(5):
        row, column = divmod(index, 2)
        left = round(width * column / 2)
        right = round(width * (column + 1) / 2)
        top = round(height * row / 3)
        bottom = round(height * (row + 1) / 3)
        inset_x, inset_y = max(3, (right - left) // 160), max(3, (bottom - top) // 120)
        crop = image.crop((left + inset_x, top + inset_y, right - inset_x, bottom - inset_y))
        crop.save(target / f"{index + 1:02d}.jpg", quality=88, optimize=True, progressive=True)

print(f"Created {len(SOURCES) * 5} gallery images in {output}")
