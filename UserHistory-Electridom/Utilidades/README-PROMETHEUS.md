# 📊 Prometheus - Observabilidad Funcional
**Calculadora Eléctrica RD - Desarrollo**

## 🎯 Propósito

Este Prometheus es una herramienta de **observabilidad funcional** para el backend (NestJS) durante los sprints de desarrollo. No se trata de "montar infra", sino de ayudarnos a **tomar decisiones** con datos mientras desarrollamos.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

**Windows (PowerShell):**
```powershell
cd UserHistory-Electridom
.\Utilidades\start-prometheus.ps1
```

**Linux/macOS (Bash):**
```bash
cd UserHistory-Electridom
chmod +x Utilidades/start-prometheus.sh
./Utilidades/start-prometheus.sh
```

### Opción 2: Manual

```bash
cd UserHistory-Electridom
docker compose up -d
```

## 📊 Acceso

- **Prometheus UI:** http://localhost:9090
- **Target API:** host.docker.internal:3000/metrics
- **API Local:** http://localhost:3000/api/metrics

## 🔍 Consultas Útiles

### 📈 Volumen de Requests por Ruta
```promql
sum by (route, method) (rate(http_requests_total[5m]))
```

### ⏱️ Latencia p95 por Ruta
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))
```

### 📊 Requests Totales
```promql
http_requests_total
```

### 🔄 Rate de Requests por Endpoint
```promql
rate(http_requests_total[1m])
```

### ⚡ Latencia Promedio
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

## 🎯 Casos de Uso

### 1. Verificar Criterios de Aceptación del Sprint 1
- ✅ `/metrics` existe y publica contadores e histogramas
- ✅ `/health` se mantiene "ok" durante las pruebas
- ✅ Métricas suben al generar tráfico

### 2. Medir Impacto de Cambios
- **Antes y después de un commit:** Compara latencia de endpoints clave
- **Detectar regresiones:** Si el tiempo p95/p99 sube, no merges sin revisar
- **Endpoints clave:** `/calc/preview`, `/calc/commit`

### 3. Monitorear el Motor de Cálculo
- Cuantificar tiempos cuando añadamos reglas (caída de tensión, protecciones, balance)
- Identificar "hot paths" cuando los requests crecen
- Métricas específicas: `calc_runs_total`, `calc_duration_seconds`

### 4. Baselines para Producción
- Guardar referencia de **tasa de solicitudes** y **latencia** en dev
- Comparar luego en staging/prod
- Documentar valores esperados

### 5. Soporte a Pruebas E2E
- Durante suite e2e, corroborar que el servicio responde estable
- Sin spikes, sin 5xx
- Monitorear estabilidad durante pruebas

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# Habilitar métricas
METRICS_ENABLED=true

# Token opcional (dejar vacío para desarrollo)
METRICS_TOKEN=
```

### Configuración de Prometheus

**Archivo:** `prometheus.yml`
```yaml
global:
  scrape_interval: 10s
  evaluation_interval: 10s
  external_labels:
    project: "calculadora-electrica-rd"
    env: "dev"

scrape_configs:
  - job_name: "calculadora-rd-api"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["host.docker.internal:3000"]
        labels:
          service: "api"
          component: "backend"
```

## 📊 Métricas Disponibles

### Métricas HTTP (Automáticas)
- `http_requests_total` - Contador total de requests
- `http_request_duration_seconds` - Histograma de duración
- `http_request_duration_seconds_bucket` - Buckets para percentiles
- `http_request_duration_seconds_sum` - Suma de duraciones
- `http_request_duration_seconds_count` - Contador de requests

### Métricas de Cálculo (Personalizadas)
- `calc_runs_total` - Contador de ejecuciones de cálculo
- `calc_duration_seconds` - Histograma de duración de cálculos

### Métricas de Node.js (Automáticas)
- `nodejs_heap_size_total_bytes` - Tamaño total del heap
- `nodejs_heap_size_used_bytes` - Memoria usada
- `nodejs_eventloop_lag_seconds` - Lag del event loop
- `nodejs_gc_duration_seconds` - Duración de garbage collection

## 🧪 Generación de Tráfico de Prueba

```bash
# Health check
curl http://localhost:3000/api/health

# Métricas
curl http://localhost:3000/api/metrics

# Endpoints de cálculo (cuando estén implementados)
curl http://localhost:3000/api/calc/preview
curl http://localhost:3000/api/calc/commit

# Generar carga
for i in {1..100}; do
  curl http://localhost:3000/api/health &
done
wait
```

## 🛑 Detener Prometheus

```bash
cd UserHistory-Electridom
docker compose down
```

## 🔍 Troubleshooting

### Prometheus no puede conectar con la API
1. Verificar que la API esté corriendo en puerto 3000
2. Verificar que `METRICS_ENABLED=true` en `.env`
3. Verificar que no haya token configurado en desarrollo
4. Probar: `curl http://localhost:3000/api/metrics`

### No aparecen métricas
1. Verificar que el interceptor de métricas esté registrado
2. Generar tráfico a la API
3. Verificar logs de la aplicación
4. Comprobar que `MetricsModule` esté importado en `AppModule`

### Docker no puede resolver host.docker.internal
1. Verificar que Docker Desktop esté corriendo
2. En Linux, agregar `extra_hosts` en docker-compose.yml
3. Probar con `localhost` en lugar de `host.docker.internal`

## 📝 Notas Importantes

- **Desarrollo:** No usar token de métricas para facilitar debugging
- **Producción:** Siempre usar token de métricas
- **Retención:** Datos se guardan por 7 días en desarrollo
- **Puerto:** Prometheus usa puerto 9090, API usa puerto 3000
- **Labels:** Usar labels consistentes para agrupación efectiva

## 🔗 Enlaces Útiles

- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [Prometheus Metrics Types](https://prometheus.io/docs/concepts/metric_types/)
- [NestJS Prometheus Integration](https://docs.nestjs.com/techniques/monitoring)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
