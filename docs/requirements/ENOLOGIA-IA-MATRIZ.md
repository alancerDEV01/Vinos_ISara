# Matriz de requisitos — ENOLOGIA - IA

Fuente: `ENOLOGIA - IA.docx`. Este archivo separa requisitos explícitos del
documento y decisiones internas del proyecto.

| # | Requisito explícito | Estado | Implementación / siguiente entrega |
|---|---|---|---|
| 1 | Plataforma web interactiva de maridaje por afinidad, contraste y cultura | Parcial | Interfaz y mapa creados; falta recorrido completo de recomendación |
| 2 | Explicar científicamente recomendaciones para públicos profesionales y educativos | Pendiente | Diseñar explicación estructurada y sección educativa |
| 3 | Base ampliable de vinos, priorizando Cinti y Valle Central de Tarija | En progreso | Catálogo web inicial basado en las tablas del documento |
| 4 | Datos generales, elaboración, fermentación, maloláctica, crianza, alcohol y añada | En progreso | Modelo frontend conserva valores no documentados como pendientes |
| 5 | Apariencia, familias aromáticas y atributos de boca cuantitativos o semicuantitativos | En progreso | Fichas sensoriales iniciales; faltan escalas validadas |
| 6 | Relación bioquímica y microbiológica de atributos | Pendiente | Catálogo educativo de compuestos, procesos y microorganismos |
| 7 | Base ampliable de gastronomía de los nueve departamentos | Parcial | Fichas territoriales iniciales; falta catálogo completo |
| 8 | Caracterización de sabores, intensidad, grasa, picor, aromas, textura, técnica e ingredientes | Pendiente | Crear perfiles organolépticos y formulario editorial |
| 9 | Motor automático de afinidad, contraste y cultura | Demostración | Existen reglas mínimas; falta motor versionado completo |
| 10 | Tres puntuaciones 0–100 y un índice global sin ocultar parciales | Demostración | Interfaz visible; valores actuales no son resultados oficiales |
| 11 | Resultado explicado, incompatibilidades y razón sensorial | Pendiente | Construir contrato de explicación y evidencia |
| 12 | Modalidades “Tengo este vino”, “Tengo este plato” y “Explorar Bolivia” | Parcial | Explorar Bolivia disponible; faltan las dos consultas |
| 13 | Primera versión basada en reglas expertas; ML posterior con evaluaciones 1–5 | Parcial | Arquitectura definida; faltan reglas validadas y captura de evaluaciones |
| 14 | Uso académico: datos trazables para análisis sensorial, biotecnología y patrimonio | Pendiente | Versionado, consentimiento, anonimización y exportaciones |

## Reglas de fidelidad al documento

1. No convertir un perfil de una añada en propiedad permanente del vino.
2. No inventar altitud, alcohol, fermentación, crianza ni descriptores faltantes.
3. Mantener afinidad, contraste y cultura como resultados independientes.
4. La IA generativa no calcula la puntuación oficial.
5. Los registros extraídos del documento permanecen en borrador hasta revisar fuentes.
6. El motor inicial es determinista y explicable; aprendizaje automático viene después.

