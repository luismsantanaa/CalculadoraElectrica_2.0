# Prometheus — ¿Para qué lo usamos en este proyecto?
**Actualizado:** 2025-08-23 03:04

Este Prometheus es una herramienta de *observabilidad funcional* para el backend (NestJS) durante los sprints.
No se trata de “montar infra”, sino de ayudarnos a **tomar decisiones** con datos mientras desarrollamos.

## ¿Para qué lo usarás (como Cursor/Dev)?
1) **Verificar criterios de aceptación del Sprint 1**  
   - Que `/metrics` existe y publica contadores e histogramas (peticiones HTTP, tiempos de respuesta).
   - Que `/health` se mantiene “ok” durante las pruebas.

2) **Medir impacto de cambios**  
   - Antes y después de un commit: compara la latencia de endpoints clave (p. ej. `/calc/preview`, `/calc/commit`).
   - Detecta regresiones: si el tiempo p95/p99 sube, no merges sin revisar.

3) **Monitorear el motor de cálculo**  
   - Cuantificar tiempos cuando añadamos reglas (caída de tensión, protecciones, balance).
   - Identificar “hot paths” cuando los requests crecen.

4) **Baselines para producción**  
   - Guardar una referencia de **tasa de solicitudes** y **latencia** en dev para comparar luego en staging/prod.

5) **Soporte a pruebas e2e**  
   - Durante una suite e2e, Prometheus permite corroborar que el servicio responde estable (sin spikes, sin 5xx).

## ¿Qué consultamos normalmente?
- `http_requests_total` — volumen por ruta.
- `http_request_duration_seconds` — latencia (focus en p95/p99).
- (Cuando se implementen) `calc_runs_total`, `calc_duration_seconds` — volumen y tiempos del cálculo.

## ¿Cómo lo encendemos? (super simple)
- Dentro de esta carpeta, ejecuta:
  - `docker compose up -d`
  - Abre **http://localhost:9090**
  - Menú *Graph* → consulta: `sum by (route, method) (rate(http_requests_total[5m]))`  
    y `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))`

> Si `/metrics` está protegido por token, **en dev** desactiva el token (o usa un sidecar). Para este kit lo dejamos **sin token**.

## ¿Cuándo lo damos por “listo”?
- Durante el Sprint 1: `/metrics` y `/health` funcionando, métricas suben al generar tráfico, y hay **evidencia** de p95 estable.
- Dejamos documentadas 2–3 consultas frecuentes en el README del repo.