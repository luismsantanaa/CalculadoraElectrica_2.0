# CE-05 — Puesta a Tierra y Conductores de Protección
**Objetivo:** Dimensionar EGC/GEC y proponer arreglo de puesta a tierra.

## Criterios de Aceptación
- Tabla `grounding_rules` (main_breaker_amp → conductor_proteccion_mm2, conductor_tierra_mm2).
- Servicio `GroundingService.size()`.
- Resultado integrado al resumen de tablero.
- Tests (≥ 8).

## Endpoint
- `POST /calc/grounding/preview`
