# Historia 4 — Métricas Prometheus (/metrics) + Logger Pino con correlación

## Contexto
Requerimos métricas de performance y trazabilidad de requests/cálculos.

## Objetivo
- `GET /metrics` (text/plain) para Prometheus.
- Instrumentación HTTP (request count, duration, status) y **custom metrics** básicas.
- Logger **Pino** integrado a Nest con **X-Request-Id** y saneamiento de datos sensibles.

## Dependencias
- `prom-client`
- `nestjs-pino` (o integración manual con Pino)

## Tareas para Cursor
1. **MetricsModule**:
   - Registrar `prom-client` y métricas: `http_requests_total`, `http_request_duration_seconds` (histogram).
   - Middleware/Interceptor para observar cada request (ruta, método, código).
   - Endpoint `GET /metrics` protegido por `METRICS_TOKEN` opcional.
2. **Logger**
   - Integrar `nestjs-pino` a nivel de `AppModule`.
   - Middleware para generar/propagar `X-Request-Id` (si no existe).
   - Mask fields: `password`, `refreshToken`, `authorization`.
   - Interceptor para log de tiempo de ejecución y tamaño de respuesta.
3. **ENV**
   - `METRICS_ENABLED=true|false`
   - `METRICS_TOKEN=` (si se quiere auth simple)
4. **Testing**
   - Unit: formateo de logs y sanitización.
   - e2e: `/metrics` expone métricas, etiquetas `method`, `route`, `status_code`.

## Criterios de Aceptación
- `/metrics` expone métricas sin PII.
- Logs incluyen `requestId` y no exponen secretos.
- Swagger actualizado con nota de observabilidad (sin listar `/metrics` si está protegido).