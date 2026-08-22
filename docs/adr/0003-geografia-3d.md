# ADR-0003: GeoJSON/PostGIS como autoridad del mapa 3D

- Estado: aceptado
- Fecha: 2026-08-22

## Contexto

La experiencia visual requiere departamentos 3D, valles y marcadores, pero las geometrías artísticas pueden introducir errores territoriales.

## Decisión

PostGIS conserva la geometría de máxima fidelidad. El frontend recibe GeoJSON simplificado por nivel de detalle y lo extruye con Three.js. Blender se limita a objetos decorativos, no a límites políticos.

## Consecuencias

- mapa verificable y actualizable;
- proceso adicional de preparación cartográfica;
- posibilidad de ofrecer una vista 2D equivalente.
