# Geografía

Aquí se incorporarán, con licencia y procedencia documentadas:

- `bolivia-departments.geojson`;
- valles vitivinícolas;
- municipios y puntos de interés necesarios.

Antes de llegar al frontend, los polígonos deberán:

1. validarse topológicamente;
2. normalizarse a WGS84;
3. simplificarse por nivel de detalle;
4. conservar una copia de máxima precisión en PostGIS;
5. registrar fuente, fecha y licencia.

## Fuente departamental incorporada

La primera geometría del frontend está en `apps/web/public/data/bolivia-departments.geojson`.

- Fuente: Órgano Electoral Plurinacional de Bolivia (OEP).
- Servicio: `GeografiaElectoral/Provincia/MapServer/1`, capa `Departamentos`.
- Formato original: GeoJSON, referencia espacial EPSG:4326.
- Consulta: 2026-08-22.
- Procesamiento: exclusión de superficies de agua presentes en la capa, selección de los nueve registros con código departamental y simplificación del servidor para visualización web.
- Página del servicio: https://geoelectoral.oep.org.bo/oep/rest/services/GeografiaElectoral/Provincia/MapServer/1

Antes de producción se verificará formalmente la licencia/reutilización, vigencia y precisión de esta capa. Si no satisface las condiciones, se sustituirá sin modificar el contrato interno del mapa.
