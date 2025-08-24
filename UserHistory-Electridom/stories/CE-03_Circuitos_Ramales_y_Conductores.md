# CE-03 — Agrupación de Circuitos Ramales + Selección de Conductores
**Objetivo:** Agrupar cargas en circuitos respetando 80% de la capacidad del interruptor y seleccionar calibre del conductor.

## Criterios de Aceptación
- Tabla `ampacity` (material, aislación, temperatura, calibre, amp).  
- Tabla `breaker_curve` (amp, polos, curva, uso).
- Algoritmo que:
  - Agrupe cargas por tipo/ambiente respetando límites configurables (`norm_const`).
  - Seleccione breaker y conductor mínimo por `ampacity` con margen 125% si aplica.
  - Calcule % de utilización por circuito.
- Soportar mono/trifásico (param `system_type`).
- Tests unitarios (≥ 15).

## Endpoint
- `POST /calc/circuits/preview`
