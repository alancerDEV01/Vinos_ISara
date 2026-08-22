"use client";

import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Path, Shape, ShapeUtils, Vector2 } from "three";
import type { DepartmentCollection, DepartmentFeature, LinearRing, PolygonCoordinates } from "./geojson";

const CENTER_LONGITUDE = -63.55;
const CENTER_LATITUDE = -16.3;
const MAP_SCALE = 0.58;

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
  const shape = new Shape(contour);
  for (const hole of polygon.slice(1)) {
    if (hole.length < 4) continue;
    shape.holes.push(new Path(normalizeRing(hole, false)));
  }
  return shape;
}

function featurePolygons(feature: DepartmentFeature): PolygonCoordinates[] {
  return feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
}

export function getDepartmentCenter(feature: DepartmentFeature): [number, number] {
  const positions = featurePolygons(feature).flat(2);
  const longitudes = positions.map(([longitude]) => longitude);
  const latitudes = positions.map(([, latitude]) => latitude);
  const projected = project([
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ]);
  return [projected.x, -projected.y];
}

function Department({
  feature,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  feature: DepartmentFeature;
  selected: boolean;
  hovered: boolean;
  onSelect: (name: string) => void;
  onHover: (name: string | null) => void;
}) {
  const geometries = useMemo(
    () => featurePolygons(feature)
      .map(polygonToShape)
      .filter((shape): shape is Shape => shape !== null)
      .map((shape) => {
        const geometry = new ExtrudeGeometry(shape, {
          depth: selected ? 0.34 : 0.22,
          bevelEnabled: true,
          bevelSegments: 2,
          bevelSize: 0.025,
          bevelThickness: 0.025,
          curveSegments: 2,
        });
        geometry.rotateX(-Math.PI / 2);
        geometry.computeVertexNormals();
        return geometry;
      }),
    [feature, selected],
  );

  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);

  const color = selected ? "#9f2d3f" : hovered ? "#9a7047" : "#5b4638";
  return (
    <group position-y={selected ? 0.11 : hovered ? 0.055 : 0}>
      {geometries.map((geometry, index) => (
        <mesh
          castShadow
          receiveShadow
          geometry={geometry}
          key={index}
          onClick={(event) => { event.stopPropagation(); onSelect(feature.properties.name); }}
          onPointerEnter={(event) => { event.stopPropagation(); onHover(feature.properties.name); document.body.style.cursor = "pointer"; }}
          onPointerLeave={() => { onHover(null); document.body.style.cursor = "default"; }}
        >
          <meshStandardMaterial
            color={color}
            emissive={selected ? "#45101a" : "#120b08"}
            emissiveIntensity={selected ? 0.9 : 0.18}
            metalness={0.12}
            roughness={0.72}
          />
        </mesh>
      ))}
    </group>
  );
}

export function BoliviaDepartmentMap({
  data,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  data: DepartmentCollection;
  selected: string;
  hovered: string | null;
  onSelect: (name: string) => void;
  onHover: (name: string | null) => void;
}) {
  return (
    <group position={[0, -0.2, 0]}>
      {data.features.map((feature) => (
        <Department
          feature={feature}
          hovered={feature.properties.name === hovered}
          key={feature.properties.code}
          onHover={onHover}
          onSelect={onSelect}
          selected={feature.properties.name === selected}
        />
      ))}
    </group>
  );
}
