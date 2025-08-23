# Script para generar tráfico de prueba para métricas
# Calculadora Eléctrica RD - Desarrollo (Windows)

Write-Host "🔄 Generando tráfico de prueba para métricas..." -ForegroundColor Green
Write-Host "📊 Proyecto: Calculadora Eléctrica RD" -ForegroundColor Cyan
Write-Host "🎯 Objetivo: Generar datos para Prometheus" -ForegroundColor Cyan
Write-Host ""

# Configuración
$API_BASE_URL = "http://localhost:3000/api"
$REQUESTS_PER_ENDPOINT = 50
$CONCURRENT_REQUESTS = 10

# Función para hacer request
function Make-Request {
    param(
        [string]$Endpoint,
        [string]$Method = "GET"
    )
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE_URL$Endpoint" -Method $Method -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode
    }
    catch {
        return $_.Exception.Response.StatusCode.value__
    }
}

# Función para generar tráfico a un endpoint
function Generate-TrafficForEndpoint {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [int]$Count
    )
    
    Write-Host "📡 Generando $Count requests a $Method $Endpoint" -ForegroundColor Blue
    
    $successCount = 0
    $errorCount = 0
    
    for ($i = 1; $i -le $Count; $i++) {
        $statusCode = Make-Request -Endpoint $Endpoint -Method $Method
        
        if ($statusCode -eq 200 -or $statusCode -eq 201) {
            $successCount++
        }
        else {
            $errorCount++
        }
        
        # Mostrar progreso cada 10 requests
        if ($i % 10 -eq 0) {
            Write-Host "  Progreso: $i/$Count" -ForegroundColor Yellow
        }
    }
    
    Write-Host "  ✅ Exitosos: $successCount" -ForegroundColor Green
    if ($errorCount -gt 0) {
        Write-Host "  ❌ Errores: $errorCount" -ForegroundColor Red
    }
    Write-Host ""
}

# Función para generar tráfico concurrente
function Generate-ConcurrentTraffic {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [int]$TotalCount,
        [int]$Concurrent
    )
    
    Write-Host "🚀 Generando $TotalCount requests concurrentes ($Concurrent simultáneos) a $Method $Endpoint" -ForegroundColor Blue
    
    $jobs = @()
    
    for ($i = 1; $i -le $TotalCount; $i += $Concurrent) {
        $batchSize = [Math]::Min($Concurrent, $TotalCount - $i + 1)
        
        # Iniciar jobs en paralelo
        for ($j = 0; $j -lt $batchSize; $j++) {
            $jobs += Start-Job -ScriptBlock {
                param($url, $method)
                try {
                    $response = Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing -TimeoutSec 5
                    return $response.StatusCode
                }
                catch {
                    return $_.Exception.Response.StatusCode.value__
                }
            } -ArgumentList "$using:API_BASE_URL$Endpoint", $Method
        }
        
        # Esperar a que terminen todos los jobs del batch
        $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        # Mostrar progreso
        Write-Host "  Batch completado: $([Math]::Min($i + $batchSize - 1, $TotalCount))/$TotalCount" -ForegroundColor Yellow
        
        # Pequeña pausa entre batches
        Start-Sleep -Milliseconds 500
    }
    
    Write-Host "  ✅ Tráfico concurrente completado" -ForegroundColor Green
    Write-Host ""
}

# Verificar que la API esté disponible
Write-Host "🔍 Verificando disponibilidad de la API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API disponible" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: La API no está disponible en $API_BASE_URL" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que la aplicación esté corriendo" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Generar tráfico básico
Write-Host "📊 Generando tráfico básico..." -ForegroundColor Blue
Generate-TrafficForEndpoint -Endpoint "/health" -Method "GET" -Count $REQUESTS_PER_ENDPOINT
Generate-TrafficForEndpoint -Endpoint "/metrics" -Method "GET" -Count $REQUESTS_PER_ENDPOINT

# Generar tráfico a endpoints de cálculo (si existen)
Write-Host "🧮 Generando tráfico a endpoints de cálculo..." -ForegroundColor Blue

# Probar endpoints de cálculo (pueden no existir aún)
try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/calc/preview" -UseBasicParsing -TimeoutSec 5
    Generate-TrafficForEndpoint -Endpoint "/calc/preview" -Method "POST" -Count ($REQUESTS_PER_ENDPOINT / 2)
}
catch {
    Write-Host "⚠️  Endpoint /calc/preview no disponible aún" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/calc/commit" -UseBasicParsing -TimeoutSec 5
    Generate-TrafficForEndpoint -Endpoint "/calc/commit" -Method "POST" -Count ($REQUESTS_PER_ENDPOINT / 2)
}
catch {
    Write-Host "⚠️  Endpoint /calc/commit no disponible aún" -ForegroundColor Yellow
}

# Generar tráfico concurrente para simular carga
Write-Host "⚡ Generando tráfico concurrente..." -ForegroundColor Blue
Generate-ConcurrentTraffic -Endpoint "/health" -Method "GET" -TotalCount ($REQUESTS_PER_ENDPOINT * 2) -Concurrent $CONCURRENT_REQUESTS

# Generar tráfico con diferentes métodos HTTP
Write-Host "🔄 Generando tráfico con diferentes métodos..." -ForegroundColor Blue
Generate-TrafficForEndpoint -Endpoint "/health" -Method "GET" -Count ($REQUESTS_PER_ENDPOINT / 4)
Generate-TrafficForEndpoint -Endpoint "/metrics" -Method "GET" -Count ($REQUESTS_PER_ENDPOINT / 4)

# Simular errores (requests a endpoints inexistentes)
Write-Host "🚨 Simulando algunos errores..." -ForegroundColor Blue
$jobs = @()
for ($i = 1; $i -le 10; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url)
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
            return $response.StatusCode
        }
        catch {
            return $_.Exception.Response.StatusCode.value__
        }
    } -ArgumentList "$using:API_BASE_URL/nonexistent"
}
$jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
Write-Host "  ✅ 10 requests a endpoint inexistente generados" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎉 Tráfico de prueba completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Próximos pasos:" -ForegroundColor Blue
Write-Host "1. Abre Prometheus: http://localhost:9090"
Write-Host "2. Ejecuta consultas como:"
Write-Host "   - sum by (route, method) (rate(http_requests_total[5m]))"
Write-Host "   - histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))"
Write-Host "3. Verifica que las métricas aparezcan en los gráficos"
Write-Host ""
Write-Host "💡 Tip: Ejecuta este script varias veces para generar más datos" -ForegroundColor Yellow
