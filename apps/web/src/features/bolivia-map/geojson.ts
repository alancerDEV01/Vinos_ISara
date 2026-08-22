export type Position = [longitude: number, latitude: number];
export type LinearRing = Position[];
export type PolygonCoordinates = LinearRing[];

export type DepartmentGeometry =
  | { type: "Polygon"; coordinates: PolygonCoordinates }
  | { type: "MultiPolygon"; coordinates: PolygonCoordinates[] };

export type DepartmentFeature = {
  type: "Feature";
  id?: number;
  properties: { code: number; name: string };
  geometry: DepartmentGeometry;
};

export type DepartmentCollection = {
  type: "FeatureCollection";
  features: DepartmentFeature[];
};
