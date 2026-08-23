# Matriz de requisitos — ENOLOGIA - IA

Fuente: `ENOLOGIA - IA.docx`. Este archivo separa requisitos explícitos del
documento y decisiones internas del proyecto.

| # | Requisito explícito | Estado | Implementación / siguiente entrega |
|---|---|---|---|
| 1 | Plataforma web interactiva de maridaje por afinidad, contraste y cultura | Implementado (v1) | Recorridos vino→plato, plato→vino y mapa territorial disponibles |
| 2 | Explicar científicamente recomendaciones para públicos profesionales y educativos | Implementado (v1) | Cada resultado muestra razones, advertencias y nota bioquímica |
| 3 | Base ampliable de vinos, priorizando Cinti y Valle Central de Tarija | En progreso | Catálogo ampliado con las tablas del documento; persiste revisión de fuentes/años |
| 4 | Datos generales, elaboración, fermentación, maloláctica, crianza, alcohol y añada | En progreso | Modelo frontend conserva valores no documentados como pendientes |
| 5 | Apariencia, familias aromáticas y atributos de boca cuantitativos o semicuantitativos | En progreso | Fichas sensoriales iniciales; faltan escalas validadas |
| 6 | Relación bioquímica y microbiológica de atributos | Pendiente | Catálogo educativo de compuestos, procesos y microorganismos |
| 7 | Base ampliable de gastronomía de los nueve departamentos | Parcial | Fichas territoriales iniciales; falta catálogo completo |
| 8 | Caracterización de sabores, intensidad, grasa, picor, aromas, textura, técnica e ingredientes | En progreso | Perfiles editoriales visibles y marcados como pendientes de validación |
| 9 | Motor automático de afinidad, contraste y cultura | Implementado (v1) | Motor determinista versionado en frontend; requiere validación experta |
| 10 | Tres puntuaciones 0–100 y un índice global sin ocultar parciales | Implementado (v1) | Se muestran siempre afinidad, contraste, territorio e índice global |
| 11 | Resultado explicado, incompatibilidades y razón sensorial | Implementado (v1) | Razones trazables, cautelas y explicación bioquímica visibles |
| 12 | Modalidades “Tengo este vino”, “Tengo este plato” y “Explorar Bolivia” | Implementado (v1) | Navegación bidireccional y territorial conectada con transición inmersiva |
| 13 | Primera versión basada en reglas expertas; ML posterior con evaluaciones 1–5 | Parcial | Reglas v1 operativas; evaluación 1–5 y entrenamiento siguen pendientes |
| 14 | Uso académico: datos trazables para análisis sensorial, biotecnología y patrimonio | Pendiente | Versionado, consentimiento, anonimización y exportaciones |

## Reglas de fidelidad al documento

1. No convertir un perfil de una añada en propiedad permanente del vino.
2. No inventar altitud, alcohol, fermentación, crianza ni descriptores faltantes.
3. Mantener afinidad, contraste y cultura como resultados independientes.
4. La IA generativa no calcula la puntuación oficial.
5. Los registros extraídos del documento permanecen en borrador hasta revisar fuentes.
6. El motor inicial es determinista y explicable; aprendizaje automático viene después.
