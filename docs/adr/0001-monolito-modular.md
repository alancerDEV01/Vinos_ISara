# ADR-0001: adoptar un monolito modular

- Estado: aceptado
- Fecha: 2026-08-22

## Contexto

El producto inicia sin implementación, tráfico conocido ni equipo que justifique operación distribuida. Aun así, catálogo, recomendaciones, evidencia, feedback y ML poseen ciclos conceptuales diferentes.

## Decisión

Desplegar API y dominio como monolito modular. Mantener límites internos, propiedad de datos y contratos explícitos. Separar web y worker como procesos desplegables.

## Consecuencias

- menor complejidad de despliegue y pruebas;
- transacciones simples;
- disciplina necesaria para evitar acoplamiento entre módulos;
- posibilidad de extraer un módulo cuando exista evidencia de carga u operación independiente.
