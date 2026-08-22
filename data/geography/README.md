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

## Relieve incorporado

Los recursos topográficos están en `apps/web/public/data/` y pueden regenerarse con `scripts/geodata/build_bolivia_elevation.py`:

- `bolivia-elevation.png`: altura normalizada;
- `bolivia-terrain-color.png`: color hipsométrico con sombreado del relieve;
- `bolivia-terrain-mask.png`: silueta continua del territorio.
- `bolivia-terrain-normal.jpg`: normales comprimidas derivadas del DEM para pendientes y microrelieve.
- `bolivia-satellite.jpg`: mosaico satelital NASA Blue Marble aplicado al terreno.

- Fuente: Terrain Tiles, Registry of Open Data on AWS (`elevation-tiles-prod`).
- Formato de origen: teselas PNG Terrarium, zoom 8.
- Procesamiento: muestreo del territorio boliviano, normalización de 0 a 7000 metros, sombreado hipsométrico y máscara territorial. El frontend desplaza una cuadrícula densa con este DEM; los departamentos son una capa interactiva independiente.
- Consulta: 2026-08-22.
- Fuente y atribuciones: https://registry.opendata.aws/terrain-tiles/

La textura de superficie procede de `BlueMarble_NextGeneration`, servida mediante el WMS oficial de NASA GIBS y recortada al mismo encuadre geográfico: https://gibs.earthdata.nasa.gov/

El raster se usa solamente para visualización; no debe emplearse para mediciones topográficas o análisis científico.
