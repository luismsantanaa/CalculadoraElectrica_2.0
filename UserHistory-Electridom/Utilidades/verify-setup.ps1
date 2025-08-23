# Script para verificar la configuración de Prometheus
# Calculadora Eléctrica RD - Desarrollo (Windows)

Write-Host "🔍 Verificando configuración de Prometheus..." -ForegroundColor Green
Write-Host "📊 Proyecto: Calculadora Eléctrica RD" -ForegroundColor Cyan
Write-Host ""

# Variables
$API_BASE_URL = "http://localhost:3000/api"
$PROMETHEUS_URL = "http://localhost:9090"
$ERRORS = 0

# Función para verificar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "🔍 Verificando $Description... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ OK" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ ERROR (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:ERRORS++
            return $false
        }
    }
    catch {
        Write-Host "❌ ERROR" -ForegroundColor Red
        $script:ERRORS++
        return $false
    }
}

# Función para verificar archivo
function Test-File {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "📁 Verificando $Description... " -NoNewline
    
    if (Test-Path $FilePath) {
        Write-Host "✅ Existe" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "❌ No encontrado" -ForegroundColor Red
        $script:ERRORS++
        return $false
    }
}

# Función para verificar variable de entorno
function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$ExpectedValue,
        [string]$Description
    )
    
    Write-Host "⚙️  Verificando $Description... " -NoNewline
    
    try {
        $envFile = "../.env"
        if (Test-Path $envFile) {
            $content = Get-Content $envFile
            $line = $content | Where-Object { $_ -match "^$VarName=" }
            if ($line) {
                $actualValue = $line.Split('=', 2)[1]
                if ($actualValue -eq $ExpectedValue) {
                    Write-Host "✅ Correcto ($actualValue)" -ForegroundColor Green
                    return $true
                }
                else {
                    Write-Host "❌ Incorrecto (esperado: $ExpectedValue, actual: $actualValue)" -ForegroundColor Red
                    $script:ERRORS++
                    return $false
                }
            }
            else {
                Write-Host "❌ Variable no encontrada" -ForegroundColor Red
                $script:ERRORS++
                return $false
            }
        }
        else {
            Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
            $script:ERRORS++
            return $false
        }
    }
    catch {
        Write-Host "❌ Error verificando variable" -ForegroundColor Red
        $script:ERRORS++
        return $false
    }
}

# Función para verificar Docker
function Test-Docker {
    Write-Host "🐳 Verificando Docker... " -NoNewline
    
    try {
        docker info | Out-Null
        Write-Host "✅ Disponible" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ No disponible" -ForegroundColor Red
        $script:ERRORS++
        return $false
    }
}

# Función para verificar contenedor
function Test-Container {
    param(
        [string]$ContainerName,
        [string]$Description
    )
    
    Write-Host "📦 Verificando $Description... " -NoNewline
    
    try {
        $containers = docker ps --format "table {{.Names}}" 2>$null
        if ($containers -match $ContainerName) {
            Write-Host "✅ Corriendo" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "⚠️  No corriendo" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "⚠️  No corriendo" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "📋 Verificaciones de archivos:" -ForegroundColor Blue
Test-File -FilePath "docker-compose.yml" -Description "docker-compose.yml"
Test-File -FilePath "prometheus.yml" -Description "prometheus.yml"
Test-File -FilePath "../.env" -Description "archivo .env en raíz del proyecto"

Write-Host ""
Write-Host "⚙️  Verificaciones de configuración:" -ForegroundColor Blue
if (Test-Path "../.env") {
    Test-EnvVar -VarName "METRICS_ENABLED" -ExpectedValue "true" -Description "METRICS_ENABLED=true"
    Test-EnvVar -VarName "METRICS_TOKEN" -ExpectedValue "" -Description "METRICS_TOKEN vacío (desarrollo)"
    Test-EnvVar -VarName "NODE_ENV" -ExpectedValue "development" -Description "NODE_ENV=development"
}
else {
    Write-Host "⚠️  Archivo .env no encontrado, saltando verificaciones de variables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🐳 Verificaciones de Docker:" -ForegroundColor Blue
Test-Docker

Write-Host ""
Write-Host "🌐 Verificaciones de conectividad:" -ForegroundColor Blue
Test-Endpoint -Url "$API_BASE_URL/health" -Description "API Health Check"
Test-Endpoint -Url "$API_BASE_URL/metrics" -Description "API Metrics Endpoint"
Test-Endpoint -Url "$PROMETHEUS_URL" -Description "Prometheus UI"

Write-Host ""
Write-Host "📦 Verificaciones de contenedores:" -ForegroundColor Blue
Test-Container -ContainerName "prometheus" -Description "Contenedor Prometheus"

Write-Host ""
Write-Host "📊 Verificaciones de métricas:" -ForegroundColor Blue
if (Test-Endpoint -Url "$API_BASE_URL/metrics" -Description "Endpoint de métricas") {
    Write-Host "🔍 Verificando contenido de métricas... " -NoNewline
    try {
        $metrics = Invoke-WebRequest -Uri "$API_BASE_URL/metrics" -UseBasicParsing -TimeoutSec 5
        if ($metrics.Content -match "http_requests_total") {
            Write-Host "✅ Métricas HTTP encontradas" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  Métricas HTTP no encontradas (puede ser normal si no hay tráfico)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error obteniendo métricas" -ForegroundColor Red
    }
    
    Write-Host "🔍 Verificando métricas de Node.js... " -NoNewline
    try {
        $metrics = Invoke-WebRequest -Uri "$API_BASE_URL/metrics" -UseBasicParsing -TimeoutSec 5
        if ($metrics.Content -match "nodejs_") {
            Write-Host "✅ Métricas Node.js encontradas" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  Métricas Node.js no encontradas" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error obteniendo métricas" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Verificaciones de Prometheus:" -ForegroundColor Blue
if (Test-Endpoint -Url "$PROMETHEUS_URL/api/v1/targets" -Description "Prometheus Targets API") {
    Write-Host "🔍 Verificando target de la API... " -NoNewline
    try {
        $targets = Invoke-WebRequest -Uri "$PROMETHEUS_URL/api/v1/targets" -UseBasicParsing -TimeoutSec 5
        if ($targets.Content -match "UP") {
            Write-Host "✅ Target de API está UP" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  Target de API no está UP (puede ser normal si no está corriendo)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Error verificando targets" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📈 Resumen de verificación:" -ForegroundColor Blue
if ($ERRORS -eq 0) {
    Write-Host "🎉 ¡Todas las verificaciones pasaron!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Próximos pasos:" -ForegroundColor Blue
    Write-Host "1. Si Prometheus no está corriendo: docker compose up -d"
    Write-Host "2. Generar tráfico: .\Utilidades\generate-test-traffic.ps1"
    Write-Host "3. Abrir Prometheus: http://localhost:9090"
    Write-Host "4. Ejecutar consultas de ejemplo"
}
else {
    Write-Host "❌ Se encontraron $ERRORS error(es)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Soluciones:" -ForegroundColor Yellow
    Write-Host "1. Verificar que Docker esté corriendo"
    Write-Host "2. Copiar dev.env.example como .env en la raíz del proyecto"
    Write-Host "3. Configurar METRICS_ENABLED=true y METRICS_TOKEN= en .env"
    Write-Host "4. Iniciar la aplicación: npm run start:dev"
    Write-Host "5. Iniciar Prometheus: docker compose up -d"
}

Write-Host ""
Write-Host "🔗 Enlaces útiles:" -ForegroundColor Blue
Write-Host "- Prometheus UI: http://localhost:9090"
Write-Host "- API Health: $API_BASE_URL/health"
Write-Host "- API Metrics: $API_BASE_URL/metrics"
Write-Host "- Documentación: .\Utilidades\README-PROMETHEUS.md"
