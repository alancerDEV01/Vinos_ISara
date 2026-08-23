"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlwaysStencilFunc, CanvasTexture, EqualStencilFunc, ExtrudeGeometry, KeepStencilOp, LinearFilter, ReplaceStencilOp, Shape, ShapeUtils, SRGBColorSpace, Vector2 } from "three";
import type { Group, MeshBasicMaterial, PointLight } from "three";
import type { DepartmentCollection, DepartmentFeature, LinearRing, PolygonCoordinates } from "./geojson";

const CENTER_LONGITUDE = -63.55;
const CENTER_LATITUDE = -16.3;
const MAP_SCALE = 0.58;
const TERRAIN_WEST = -69.75;
const TERRAIN_EAST = -57.35;
const TERRAIN_NORTH = -9.55;
const TERRAIN_SOUTH = -22.95;
const TERRAIN_WIDTH = (TERRAIN_EAST - TERRAIN_WEST) * MAP_SCALE;
const TERRAIN_HEIGHT = (TERRAIN_NORTH - TERRAIN_SOUTH) * MAP_SCALE;
const TERRAIN_CENTER_Z = -(((TERRAIN_NORTH + TERRAIN_SOUTH) / 2) - CENTER_LATITUDE) * MAP_SCALE;

type ElevationRaster = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  texture: CanvasTexture;
  colorTexture: CanvasTexture;
  maskTexture: CanvasTexture;
  normalTexture: CanvasTexture;
};

function useBoliviaElevation(lowPower: boolean): ElevationRaster | null {
  const [raster, setRaster] = useState<ElevationRaster | null>(null);

  useEffect(() => {
    let active = true;
    const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
    const canvasFrom = (image: HTMLImageElement) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      canvas.getContext("2d")?.drawImage(image, 0, 0);
      return canvas;
    };

    Promise.all([
      loadImage("/data/bolivia-elevation.png"),
      loadImage("/data/bolivia-satellite.jpg"),
      loadImage("/data/bolivia-terrain-mask.png"),
      loadImage(lowPower ? "/data/bolivia-terrain-mask.png" : "/data/bolivia-terrain-normal.jpg"),
    ]).then(([elevationImage, colorImage, maskImage, normalImage]) => {
      if (!active) return;
      const elevationCanvas = canvasFrom(elevationImage);
      const elevationContext = elevationCanvas.getContext("2d", { willReadFrequently: true });
      if (!elevationContext) return;
      const texture = new CanvasTexture(elevationCanvas);
      const colorTexture = new CanvasTexture(canvasFrom(colorImage));
      const maskTexture = new CanvasTexture(canvasFrom(maskImage));
      const normalTexture = new CanvasTexture(canvasFrom(normalImage));
      texture.minFilter = LinearFilter;
      colorTexture.minFilter = LinearFilter;
      colorTexture.colorSpace = SRGBColorSpace;
      colorTexture.anisotropy = lowPower ? 2 : 8;
      maskTexture.minFilter = LinearFilter;
      normalTexture.minFilter = LinearFilter;
      normalTexture.anisotropy = lowPower ? 2 : 8;
      setRaster({
        data: elevationContext.getImageData(0, 0, elevationCanvas.width, elevationCanvas.height).data,
        width: elevationCanvas.width,
        height: elevationCanvas.height,
        texture,
        colorTexture,
        maskTexture,
        normalTexture,
      });
    }).catch(() => console.error("No se pudieron cargar las texturas del terreno de Bolivia"));
    return () => { active = false; };
  }, [lowPower]);

  return raster;
}

function sampleElevation(raster: ElevationRaster, longitude: number, latitude: number): number {
  const u = Math.max(0, Math.min(1, (longitude - TERRAIN_WEST) / (TERRAIN_EAST - TERRAIN_WEST)));
  const v = Math.max(0, Math.min(1, (TERRAIN_NORTH - latitude) / (TERRAIN_NORTH - TERRAIN_SOUTH)));
  const x = Math.round(u * (raster.width - 1));
  const y = Math.round(v * (raster.height - 1));
  return raster.data[(y * raster.width + x) * 4] / 255;
}

function Terrain({ elevation, focused, lowPower }: { elevation: ElevationRaster; focused: boolean; lowPower: boolean }) {
  return (
    <mesh castShadow={!lowPower} receiveShadow={!lowPower} position={[0, 0, TERRAIN_CENTER_Z]} renderOrder={2} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[TERRAIN_WIDTH, TERRAIN_HEIGHT, lowPower ? 128 : 256, lowPower ? 140 : 278]} />
      <meshStandardMaterial
        alphaMap={elevation.maskTexture}
        alphaTest={0.35}
        displacementMap={elevation.texture}
        displacementScale={0.44}
        map={elevation.colorTexture}
        metalness={0}
        normalMap={lowPower ? undefined : elevation.normalTexture}
        normalScale={lowPower ? undefined : new Vector2(0.92, 0.92)}
        roughness={focused ? 0.66 : 0.84}
        transparent
        stencilFail={KeepStencilOp}
        stencilFunc={focused ? EqualStencilFunc : AlwaysStencilFunc}
        stencilRef={1}
        stencilWrite={focused}
        stencilZFail={KeepStencilOp}
        stencilZPass={KeepStencilOp}
      />
    </mesh>
  );
}

function SelectionPulse({
  position,
  delay,
}: {
  position: [number, number, number];
  delay: number;
}) {
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const light = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    const progress = ((clock.elapsedTime / 1.8) + delay) % 1;
    const scale = 0.7 + progress * 2.15;
    group.current?.scale.set(scale, scale, scale);
    if (material.current) material.current.opacity = Math.pow(1 - progress, 1.7) * 0.58;
    if (light.current) light.current.intensity = Math.pow(1 - progress, 2) * 2.4;
  });

  return (
    <group position={position} ref={group}>
      <pointLight color="#ffc75c" distance={2.2} decay={2} position={[0, 0.28, 0]} ref={light} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.19, 0.225, 64]} />
        <meshBasicMaterial color="#ffd66f" depthWrite={false} ref={material} transparent />
      </mesh>
    </group>
  );
}

function project([longitude, latitude]: [number, number]): Vector2 {
  return new Vector2(
    (longitude - CENTER_LONGITUDE) * MAP_SCALE,
    (latitude - CENTER_LATITUDE) * MAP_SCALE,
  );
}

function normalizeRing(ring: LinearRing, clockwise: boolean): Vector2[] {
  const points = ring.map(project);
  if (points.length > 1 && points[0].equals(points.at(-1)!)) points.pop();
  if (ShapeUtils.isClockWise(points) !== clockwise) points.reverse();
  return points;
}

function polygonToShape(polygon: PolygonCoordinates): Shape | null {
  if (!polygon[0] || polygon[0].length < 4) return null;
  const contour = normalizeRing(polygon[0], true);

  // The source keeps lakes and salars as inner rings. Extruding those rings
  // produces deep walls and triangulation spikes, especially in Oruro and
  // Potosi. The interactive department layer is a solid administrative map;
  // water bodies can be rendered later as a separate, flat overlay.
  return new Shape(contour);
}

function featurePolygons(feature: DepartmentFeature): PolygonCoordinates[] {
  return feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
}

function ringAreaAndCentroid(ring: LinearRing): { area: number; longitude: number; latitude: number } {
  let twiceArea = 0;
  let longitudeSum = 0;
  let latitudeSum = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    longitudeSum += (x1 + x2) * cross;
    latitudeSum += (y1 + y2) * cross;
  }
  const area = twiceArea / 2;
  if (Math.abs(area) < 0.000001) {
    const coordinates = ring.slice(0, -1);
    return {
      area: 0,
      longitude: coordinates.reduce((sum, [longitude]) => sum + longitude, 0) / coordinates.length,
      latitude: coordinates.reduce((sum, [, latitude]) => sum + latitude, 0) / coordinates.length,
    };
  }
  return {
    area: Math.abs(area),
    longitude: longitudeSum / (6 * area),
    latitude: latitudeSum / (6 * area),
  };
}

function getDepartmentAnchor(feature: DepartmentFeature): [number, number] {
  const largest = featurePolygons(feature)
    .map((polygon) => ringAreaAndCentroid(polygon[0]))
    .sort((a, b) => b.area - a.area)[0];
  return [largest.longitude, largest.latitude];
}

export function getDepartmentCenter(feature: DepartmentFeature): [number, number] {
  const points = featurePolygons(feature).flat(2).map(project);
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  return [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    -((Math.min(...ys) + Math.max(...ys)) / 2),
  ];
}

export function getDepartmentSpan(feature: DepartmentFeature): number {
  const { depth, width } = getDepartmentSize(feature);
  return Math.max(width, depth);
}

export function getDepartmentSize(feature: DepartmentFeature): { width: number; depth: number } {
  const positions = featurePolygons(feature).flat(2).map(project);
  const xs = positions.map(({ x }) => x);
  const ys = positions.map(({ y }) => y);
  return {
    width: Math.max(...xs) - Math.min(...xs),
    depth: Math.max(...ys) - Math.min(...ys),
  };
}

export function getBoliviaMapCenter(data: DepartmentCollection): [number, number] {
  const points = data.features.flatMap((feature) => featurePolygons(feature))
    .flatMap((polygon) => polygon[0])
    .map(project);
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  return [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    -((Math.min(...ys) + Math.max(...ys)) / 2),
  ];
}

function Department({
  feature,
  selected,
  focused,
  hovered,
  onSelect,
  onHover,
  elevation,
  lowPower,
}: {
  feature: DepartmentFeature;
  selected: boolean;
  focused: boolean;
  hovered: boolean;
  onSelect: (name: string) => void;
  onHover: (name: string | null) => void;
  elevation: ElevationRaster;
  lowPower: boolean;
}) {
  const geometries = useMemo(
    () => featurePolygons(feature)
      .map(polygonToShape)
      .filter((shape): shape is Shape => shape !== null)
      .map((shape) => {
        const geometry = new ExtrudeGeometry(shape, {
          depth: 0.006,
          bevelEnabled: false,
        });
        geometry.rotateX(-Math.PI / 2);
        return geometry;
      }),
    [feature],
  );

  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);

  const outlines = useMemo(() => featurePolygons(feature).map((polygon) => polygon[0].map(([longitude, latitude]) => {
    const point = project([longitude, latitude]);
    return [point.x, sampleElevation(elevation, longitude, latitude) * 0.44 + 0.105, -point.y] as [number, number, number];
  })), [elevation, feature]);
  const labelPosition = useMemo(() => {
    const [longitude, latitude] = getDepartmentAnchor(feature);
    const point = project([longitude, latitude]);
    return [point.x, sampleElevation(elevation, longitude, latitude) * 0.44 + 0.12, -point.y] as [number, number, number];
  }, [elevation, feature]);

  return (
    <group>
      {selected && focused ? null : outlines.map((points, index) => (
        <group key={`outline-${index}`}>
          <Line
            color={selected ? "#3f2d12" : "#211a12"}
            depthTest={!selected}
            lineWidth={selected ? 4.1 : hovered ? 3.2 : 2.15}
            opacity={selected ? 0.96 : 0.46}
            points={points}
            renderOrder={selected ? 20 : 0}
            transparent
          />
          <Line
            color={selected ? "#ffd76a" : hovered ? "#fff0c4" : "#e7d8b6"}
            depthTest={!selected}
            lineWidth={selected ? 2.05 : hovered ? 1.45 : 0.82}
            opacity={selected ? 1 : hovered ? 0.94 : 0.68}
            points={points}
            renderOrder={selected ? 21 : 0}
            transparent
          />
        </group>
      ))}
      {selected && !lowPower ? (
        <>
          <SelectionPulse delay={0} position={labelPosition} />
          <SelectionPulse delay={0.5} position={labelPosition} />
        </>
      ) : null}
      <Html center distanceFactor={8.5} position={labelPosition} style={{ pointerEvents: "none" }}>
        <span className={`mapLabel${selected ? " selected" : ""}${focused && !selected ? " muted" : ""}`}>{feature.properties.name}</span>
      </Html>
      <group position-y={0.62}>
      {geometries.map((geometry, index) => (
        <group key={index}>
        {selected && focused ? <mesh geometry={geometry} renderOrder={1}>
          <meshBasicMaterial
            colorWrite={false}
            depthTest={false}
            depthWrite={false}
            stencilFunc={AlwaysStencilFunc}
            stencilRef={1}
            stencilWrite
            stencilZPass={ReplaceStencilOp}
          />
        </mesh> : null}
        <mesh
          geometry={geometry}
          onClick={(event) => { event.stopPropagation(); onSelect(feature.properties.name); }}
          onPointerEnter={(event) => { event.stopPropagation(); onHover(feature.properties.name); document.body.style.cursor = "pointer"; }}
          onPointerLeave={() => { onHover(null); document.body.style.cursor = "default"; }}
        >
          <meshBasicMaterial
            color="#ffffff"
            depthWrite={false}
            opacity={0.001}
            transparent
          />
        </mesh>
        </group>
      ))}
      </group>
    </group>
  );
}

export function BoliviaDepartmentMap({
  data,
  selected,
  hovered,
  focused,
  onSelect,
  onHover,
  lowPower = false,
}: {
  data: DepartmentCollection;
  selected: string;
  hovered: string | null;
  focused: string | null;
  onSelect: (name: string) => void;
  onHover: (name: string | null) => void;
  lowPower?: boolean;
}) {
  const elevation = useBoliviaElevation(lowPower);
  if (!elevation) return null;
  return (
    <group position={[0, -0.2, 0]}>
      {!lowPower ? <mesh position={[0, -0.035, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.2, 10]} />
        <shadowMaterial opacity={0.2} transparent />
      </mesh> : null}
      <Terrain elevation={elevation} focused={focused !== null} lowPower={lowPower} />
      {data.features.filter((feature) => !focused || feature.properties.name === selected).map((feature) => (
        <Department
          feature={feature}
          elevation={elevation}
          hovered={feature.properties.name === hovered}
          focused={focused !== null}
          key={feature.properties.code}
          lowPower={lowPower}
          onHover={onHover}
          onSelect={onSelect}
          selected={feature.properties.name === selected}
        />
      ))}
    </group>
  );
}
