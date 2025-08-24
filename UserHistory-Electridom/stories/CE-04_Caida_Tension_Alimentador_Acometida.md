# CE-04 — Caída de Tensión, Alimentador y Acometida
**Objetivo:** Dimensionar alimentador considerando caída de tensión y límites (3% ramal, 5% total por defecto, desde `norm_const`).

## Criterios de Aceptación
- Tabla `resistivity` (material, sección, Ω·km).
- Función `VoltageDropService.selectFeeder()` que sugiere calibre por longitud y corriente.
- Reportar: % caida ramal, % total, calibre sugerido, longitud crítica.
- Tests (≥ 10), casos con longitudes grandes.

## Endpoint
- `POST /calc/feeder/preview`
