# Despliegues Compose

- `compose.yaml` en la raíz: entorno local completo.
- Este directorio contendrá overlays de staging y producción.
- Los secretos de producción se inyectan desde el entorno o un gestor; nunca se incluyen en Git.
