# Backend de dominio

El dominio no depende de FastAPI ni de la base de datos. Las aplicaciones en `apps/` lo consumen mediante casos de uso y adaptadores.

Módulos iniciales:

- `catalog`: vinos, platos, territorios y taxonomías;
- `pairing`: cálculo y explicación de maridajes;
- `evidence`: fuentes, afirmaciones y revisiones;
- `feedback`: estudios y evaluaciones;
- `admin`: flujo editorial y auditoría;
- `ml`: límites para datasets y modelos futuros.
