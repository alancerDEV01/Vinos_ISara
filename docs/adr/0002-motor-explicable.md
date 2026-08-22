# ADR-0002: motor determinista y explicaciones estructuradas

- Estado: aceptado
- Fecha: 2026-08-22

## Contexto

El documento exige puntuaciones parciales visibles y razones científicas. Un texto generado sin trazabilidad no satisface este requisito.

## Decisión

El MVP usa reglas versionadas. Cada regla produce puntos, dimensión, atributos, evidencia y clave de explicación. Las plantillas redactan el resultado; un LLM futuro sólo podrá parafrasear hechos permitidos.

## Consecuencias

- recomendaciones reproducibles y auditables;
- necesidad de curar reglas y casos dorados;
- el ML deberá demostrar mejora y mantener restricciones expertas.
