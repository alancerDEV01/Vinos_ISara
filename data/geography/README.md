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
