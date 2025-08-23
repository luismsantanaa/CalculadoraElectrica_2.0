#!/bin/bash

# Script para iniciar Prometheus para observabilidad funcional
# Calculadora Eléctrica RD - Desarrollo

echo "🚀 Iniciando Prometheus para observabilidad funcional..."
echo "📊 Proyecto: Calculadora Eléctrica RD"
echo "🔧 Ambiente: Desarrollo"
echo ""

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    echo "💡 Por favor, inicia Docker Desktop y vuelve a intentar"
    exit 1
fi

# Verificar que el archivo docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.yml"
    echo "💡 Asegúrate de ejecutar este script desde la carpeta UserHistory-Electridom"
    exit 1
fi

# Verificar que el archivo prometheus.yml existe
if [ ! -f "prometheus.yml" ]; then
    echo "❌ Error: No se encontró prometheus.yml"
    echo "💡 Asegúrate de que el archivo de configuración existe"
    exit 1
fi

echo "✅ Verificaciones completadas"
echo ""

# Detener contenedores existentes si los hay
echo "🛑 Deteniendo contenedores existentes..."
docker compose down > /dev/null 2>&1

# Iniciar Prometheus
echo "🔧 Iniciando Prometheus..."
docker compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Prometheus iniciado exitosamente!"
    echo ""
    echo "📊 Acceso a Prometheus:"
    echo "   🌐 URL: http://localhost:9090"
    echo "   📈 Target: host.docker.internal:3000/metrics"
    echo ""
    echo "🔍 Consultas útiles para copiar y pegar:"
    echo ""
    echo "📊 Volumen de requests por ruta:"
    echo "   sum by (route, method) (rate(http_requests_total[5m]))"
    echo ""
    echo "⏱️  Latencia p95 por ruta:"
    echo "   histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))"
    echo ""
    echo "📈 Requests totales:"
    echo "   http_requests_total"
    echo ""
    echo "🔄 Para generar tráfico de prueba:"
    echo "   curl http://localhost:3000/api/health"
    echo "   curl http://localhost:3000/api/metrics"
    echo ""
    echo "🛑 Para detener Prometheus:"
    echo "   docker compose down"
    echo ""
    echo "📝 Nota: Asegúrate de que tu API NestJS esté corriendo en el puerto 3000"
    echo "   y que METRICS_ENABLED=true en tu archivo .env"
else
    echo "❌ Error al iniciar Prometheus"
    echo "💡 Revisa los logs con: docker compose logs"
    exit 1
fi
