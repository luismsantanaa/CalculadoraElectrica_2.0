# 🛠️ Utilidades - Calculadora Eléctrica RD

Esta carpeta contiene herramientas y scripts para facilitar el desarrollo y monitoreo del proyecto.

## 📁 Contenido

### 🚀 Scripts de Inicio

| Script | Descripción | Plataforma |
|--------|-------------|------------|
| `start-prometheus.sh` | Inicia Prometheus para observabilidad | Linux/macOS |
| `start-prometheus.ps1` | Inicia Prometheus para observabilidad | Windows |

### 🔍 Scripts de Verificación

| Script | Descripción | Plataforma |
|--------|-------------|------------|
| `verify-setup.sh` | Verifica la configuración completa | Linux/macOS |
| `verify-setup.ps1` | Verifica la configuración completa | Windows |

### 📊 Scripts de Generación de Tráfico

| Script | Descripción | Plataforma |
|--------|-------------|------------|
| `generate-test-traffic.sh` | Genera tráfico de prueba para métricas | Linux/macOS |
| `generate-test-traffic.ps1` | Genera tráfico de prueba para métricas | Windows |

### 📋 Archivos de Configuración

| Archivo | Descripción |
|---------|-------------|
| `dev.env.example` | Variables de entorno para desarrollo |
| `README-PROMETHEUS.md` | Documentación completa de Prometheus |

## 🚀 Inicio Rápido

### 1. Configurar el Entorno

```bash
# Copiar configuración de desarrollo
cp Utilidades/dev.env.example .env

# Verificar configuración
cd UserHistory-Electridom
./Utilidades/verify-setup.sh
```

### 2. Iniciar Prometheus

**Linux/macOS:**
```bash
cd UserHistory-Electridom
chmod +x Utilidades/start-prometheus.sh
./Utilidades/start-prometheus.sh
```

**Windows:**
```powershell
cd UserHistory-Electridom
.\Utilidades\start-prometheus.ps1
```

### 3. Generar Tráfico de Prueba

**Linux/macOS:**
```bash
cd UserHistory-Electridom
chmod +x Utilidades/generate-test-traffic.sh
./Utilidades/generate-test-traffic.sh
```

**Windows:**
```powershell
cd UserHistory-Electridom
.\Utilidades\generate-test-traffic.ps1
```

### 4. Acceder a Prometheus

- **URL:** http://localhost:9090
- **Target:** host.docker.internal:3000/metrics

## 📊 Consultas Útiles

### Volumen de Requests
```promql
sum by (route, method) (rate(http_requests_total[5m]))
```

### Latencia p95
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))
```

### Requests Totales
```promql
http_requests_total
```

## 🔧 Configuración Requerida

### Variables de Entorno

```bash
# Habilitar métricas
METRICS_ENABLED=true

# Token vacío para desarrollo
METRICS_TOKEN=

# Ambiente de desarrollo
NODE_ENV=development
```

### Dependencias

- Docker Desktop
- Node.js (para la aplicación)
- curl (para scripts bash)
- PowerShell (para scripts Windows)

## 🎯 Casos de Uso

### 1. Verificar Criterios de Aceptación
- ✅ `/metrics` existe y publica contadores e histogramas
- ✅ `/health` se mantiene "ok" durante las pruebas
- ✅ Métricas suben al generar tráfico

### 2. Medir Impacto de Cambios
- Antes y después de un commit: compara latencia
- Detecta regresiones: si p95/p99 sube, no merges sin revisar

### 3. Monitorear el Motor de Cálculo
- Cuantificar tiempos de reglas (caída de tensión, protecciones)
- Identificar "hot paths" cuando los requests crecen

### 4. Baselines para Producción
- Guardar referencia de tasa de solicitudes y latencia
- Comparar luego en staging/prod

### 5. Soporte a Pruebas E2E
- Corroborar que el servicio responde estable
- Sin spikes, sin 5xx durante pruebas

## 🛑 Comandos de Mantenimiento

### Detener Prometheus
```bash
cd UserHistory-Electridom
docker compose down
```

### Verificar Estado
```bash
cd UserHistory-Electridom
./Utilidades/verify-setup.sh
```

### Limpiar Contenedores
```bash
docker compose down -v
docker system prune -f
```

## 🔍 Troubleshooting

### Prometheus no puede conectar
1. Verificar que la API esté corriendo en puerto 3000
2. Verificar `METRICS_ENABLED=true` en `.env`
3. Verificar que no haya token configurado en desarrollo
4. Probar: `curl http://localhost:3000/api/metrics`

### No aparecen métricas
1. Verificar que el interceptor de métricas esté registrado
2. Generar tráfico a la API
3. Verificar logs de la aplicación
4. Comprobar que `MetricsModule` esté importado

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

- [Documentación Prometheus](./README-PROMETHEUS.md)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [NestJS Prometheus Integration](https://docs.nestjs.com/techniques/monitoring)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)

## 📞 Soporte

Para problemas o preguntas sobre las utilidades:

1. Revisar la documentación en `README-PROMETHEUS.md`
2. Ejecutar `verify-setup.sh` para diagnóstico
3. Verificar logs de Docker: `docker compose logs`
4. Consultar la documentación oficial de Prometheus
