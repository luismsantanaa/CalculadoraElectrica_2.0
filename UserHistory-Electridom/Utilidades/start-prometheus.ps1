# Script para iniciar Prometheus para observabilidad funcional
# Calculadora Eléctrica RD - Desarrollo (Windows)

Write-Host "🚀 Iniciando Prometheus para observabilidad funcional..." -ForegroundColor Green
Write-Host "📊 Proyecto: Calculadora Eléctrica RD" -ForegroundColor Cyan
Write-Host "🔧 Ambiente: Desarrollo" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté corriendo
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker no está corriendo" -ForegroundColor Red
    Write-Host "💡 Por favor, inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}

# Verificar que el archivo docker-compose.yml existe
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: No se encontró docker-compose.yml" -ForegroundColor Red
    Write-Host "💡 Asegúrate de ejecutar este script desde la carpeta UserHistory-Electridom" -ForegroundColor Yellow
    exit 1
}

# Verificar que el archivo prometheus.yml existe
if (-not (Test-Path "prometheus.yml")) {
    Write-Host "❌ Error: No se encontró prometheus.yml" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que el archivo de configuración existe" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Verificaciones completadas" -ForegroundColor Green
Write-Host ""

# Detener contenedores existentes si los hay
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker compose down 2>$null

# Iniciar Prometheus
Write-Host "🔧 Iniciando Prometheus..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Prometheus iniciado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Acceso a Prometheus:" -ForegroundColor Cyan
    Write-Host "   🌐 URL: http://localhost:9090" -ForegroundColor White
    Write-Host "   📈 Target: host.docker.internal:3000/metrics" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Consultas útiles para copiar y pegar:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Volumen de requests por ruta:" -ForegroundColor Yellow
    Write-Host "   sum by (route, method) (rate(http_requests_total[5m]))" -ForegroundColor White
    Write-Host ""
    Write-Host "⏱️  Latencia p95 por ruta:" -ForegroundColor Yellow
    Write-Host "   histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))" -ForegroundColor White
    Write-Host ""
    Write-Host "📈 Requests totales:" -ForegroundColor Yellow
    Write-Host "   http_requests_total" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 Para generar tráfico de prueba:" -ForegroundColor Yellow
    Write-Host "   curl http://localhost:3000/api/health" -ForegroundColor White
    Write-Host "   curl http://localhost:3000/api/metrics" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Para detener Prometheus:" -ForegroundColor Yellow
    Write-Host "   docker compose down" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Nota: Asegúrate de que tu API NestJS esté corriendo en el puerto 3000" -ForegroundColor Yellow
    Write-Host "   y que METRICS_ENABLED=true en tu archivo .env" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error al iniciar Prometheus" -ForegroundColor Red
    Write-Host "💡 Revisa los logs con: docker compose logs" -ForegroundColor Yellow
    exit 1
}
