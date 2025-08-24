# CE-02 — Factores de Demanda y Carga Diversificada
**Objetivo:** Aplicar factores de demanda por tipo de carga conforme RIE/NEC **parametrizados**.

## Criterios de Aceptación
- Tabla `demand_factor` con columnas: `category`, `range_min`, `range_max`, `factor`, `notes`.
- Servicio `DemandService.apply()` que recibe cargas agregadas y devuelve carga diversificada.
- Cubrir categorías: iluminación general, tomacorrientes generales, electrodomésticos fijos, climatización, especiales.
- Tests (≥ 12) con rangos y bordes.
- Métrica `calc_demand_va_total`.

## Endpoint
- `POST /calc/demand/preview` — recibe salida de CE‑01 y retorna estructura diversificada.
