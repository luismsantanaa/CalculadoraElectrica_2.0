# CE-01 — Motor de Cálculo de Cargas por Ambiente (Backend NestJS)
**Fecha:** 2025-08-23  
**Objetivo:** Implementar el núcleo que procesa `superficies` y `consumos` y calcula cargas por ambiente.

## Entradas
- JSON `input.schema.json` (ver carpeta `schemas/`). Recibe:
  - `superficies`: lista de ambientes (nombre, área m²).
  - `consumos`: lista de artefactos (nombre, ambiente, watts o VA, fp opcional).

## Salidas
- JSON `output.schema.json` (ver `schemas/`): cargas por ambiente y totales (VA, kW), fp efectivo, observaciones.

## Criterios de Aceptación
- Validar contra `input.schema.json` (AJV o Zod).
- Calcular por ambiente: suma de cargas definidas + carga base de iluminación por m² **parametrizable** (leer de tabla `norm_const`).
- Registrar métricas Prometheus: `calc_env_total_va`, `calc_env_duration_ms`.
- Pruebas unitarias (Jest) ≥ 15 casos representativos.
- Swagger actualizado.

## Tareas
1. DTOs + Pipes de validación.
2. Servicio `CalcEngineService.calcByRoom()`.
3. Capa de parámetros: `NormParamService` (lee/bootea `norm_const`).
4. Exponer endpoint `POST /calc/rooms/preview`.
5. Tests unit y e2e con payloads de `samples/`.

## Notas normativas
- **No** fijar valores rígidos del RIE/NEC. Cargar desde BD (`seeds/01_norm_const.sql`).  
- Valores por defecto marcados como `TODO_RIE` deberán ajustarse por el ingeniero responsable.
