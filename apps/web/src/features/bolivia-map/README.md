# Mapa 3D de Bolivia

Este módulo contiene la primera proyección geográfica, extrusión departamental, selección y cámara. Los marcadores y niveles de detalle se incorporarán progresivamente.

Reglas:

- GeoJSON es la fuente geométrica; no dibujar departamentos a mano.
- Cada departamento tiene código estable y ruta web.
- El modo 3D debe ofrecer una alternativa 2D accesible.
- Los objetos 3D no contienen lógica de recomendación.
- Los marcadores se cargan por región y nivel de zoom.

## Implementado

- carga local de GeoJSON;
- nueve departamentos reales;
- soporte Polygon y MultiPolygon;
- proyección WGS84 a coordenadas de escena;
- extrusión, bisel, hover y selección;
- elevación del departamento seleccionado;
- vuelo de cámara;
- selector 2D equivalente.
