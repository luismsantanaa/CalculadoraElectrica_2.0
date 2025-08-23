#!/bin/bash

# Script para verificar la configuración de Prometheus
# Calculadora Eléctrica RD - Desarrollo

echo "🔍 Verificando configuración de Prometheus..."
echo "📊 Proyecto: Calculadora Eléctrica RD"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
API_BASE_URL="http://localhost:3000/api"
PROMETHEUS_URL="http://localhost:9090"
ERRORS=0

# Función para verificar endpoint
check_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "🔍 Verificando $description... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Función para verificar archivo
check_file() {
    local file=$1
    local description=$2
    
    echo -n "📁 Verificando $description... "
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Existe${NC}"
        return 0
    else
        echo -e "${RED}❌ No encontrado${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Función para verificar variable de entorno
check_env_var() {
    local var_name=$1
    local expected_value=$2
    local description=$3
    
    echo -n "⚙️  Verificando $description... "
    
    local actual_value=$(grep "^$var_name=" .env 2>/dev/null | cut -d'=' -f2-)
    
    if [ "$actual_value" = "$expected_value" ]; then
        echo -e "${GREEN}✅ Correcto ($actual_value)${NC}"
        return 0
    else
        echo -e "${RED}❌ Incorrecto (esperado: $expected_value, actual: $actual_value)${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Función para verificar Docker
check_docker() {
    echo -n "🐳 Verificando Docker... "
    
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Disponible${NC}"
        return 0
    else
        echo -e "${RED}❌ No disponible${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Función para verificar contenedor
check_container() {
    local container_name=$1
    local description=$2
    
    echo -n "📦 Verificando $description... "
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        echo -e "${GREEN}✅ Corriendo${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  No corriendo${NC}"
        return 1
    fi
}

echo -e "${BLUE}📋 Verificaciones de archivos:${NC}"
check_file "docker-compose.yml" "docker-compose.yml"
check_file "prometheus.yml" "prometheus.yml"
check_file "../.env" "archivo .env en raíz del proyecto"

echo ""
echo -e "${BLUE}⚙️  Verificaciones de configuración:${NC}"
if [ -f "../.env" ]; then
    check_env_var "METRICS_ENABLED" "true" "METRICS_ENABLED=true"
    check_env_var "METRICS_TOKEN" "" "METRICS_TOKEN vacío (desarrollo)"
    check_env_var "NODE_ENV" "development" "NODE_ENV=development"
else
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado, saltando verificaciones de variables${NC}"
fi

echo ""
echo -e "${BLUE}🐳 Verificaciones de Docker:${NC}"
check_docker

echo ""
echo -e "${BLUE}🌐 Verificaciones de conectividad:${NC}"
check_endpoint "$API_BASE_URL/health" "API Health Check"
check_endpoint "$API_BASE_URL/metrics" "API Metrics Endpoint"
check_endpoint "$PROMETHEUS_URL" "Prometheus UI"

echo ""
echo -e "${BLUE}📦 Verificaciones de contenedores:${NC}"
check_container "prometheus" "Contenedor Prometheus"

echo ""
echo -e "${BLUE}📊 Verificaciones de métricas:${NC}"
if check_endpoint "$API_BASE_URL/metrics" "Endpoint de métricas"; then
    echo -n "🔍 Verificando contenido de métricas... "
    if curl -s "$API_BASE_URL/metrics" | grep -q "http_requests_total"; then
        echo -e "${GREEN}✅ Métricas HTTP encontradas${NC}"
    else
        echo -e "${YELLOW}⚠️  Métricas HTTP no encontradas (puede ser normal si no hay tráfico)${NC}"
    fi
    
    echo -n "🔍 Verificando métricas de Node.js... "
    if curl -s "$API_BASE_URL/metrics" | grep -q "nodejs_"; then
        echo -e "${GREEN}✅ Métricas Node.js encontradas${NC}"
    else
        echo -e "${YELLOW}⚠️  Métricas Node.js no encontradas${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🎯 Verificaciones de Prometheus:${NC}"
if check_endpoint "$PROMETHEUS_URL/api/v1/targets" "Prometheus Targets API"; then
    echo -n "🔍 Verificando target de la API... "
    if curl -s "$PROMETHEUS_URL/api/v1/targets" | grep -q "UP"; then
        echo -e "${GREEN}✅ Target de API está UP${NC}"
    else
        echo -e "${YELLOW}⚠️  Target de API no está UP (puede ser normal si no está corriendo)${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📈 Resumen de verificación:${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todas las verificaciones pasaron!${NC}"
    echo ""
    echo -e "${BLUE}📊 Próximos pasos:${NC}"
    echo "1. Si Prometheus no está corriendo: docker compose up -d"
    echo "2. Generar tráfico: ./Utilidades/generate-test-traffic.sh"
    echo "3. Abrir Prometheus: http://localhost:9090"
    echo "4. Ejecutar consultas de ejemplo"
else
    echo -e "${RED}❌ Se encontraron $ERRORS error(es)${NC}"
    echo ""
    echo -e "${YELLOW}💡 Soluciones:${NC}"
    echo "1. Verificar que Docker esté corriendo"
    echo "2. Copiar dev.env.example como .env en la raíz del proyecto"
    echo "3. Configurar METRICS_ENABLED=true y METRICS_TOKEN= en .env"
    echo "4. Iniciar la aplicación: npm run start:dev"
    echo "5. Iniciar Prometheus: docker compose up -d"
fi

echo ""
echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo "- Prometheus UI: http://localhost:9090"
echo "- API Health: $API_BASE_URL/health"
echo "- API Metrics: $API_BASE_URL/metrics"
echo "- Documentación: ./Utilidades/README-PROMETHEUS.md"
