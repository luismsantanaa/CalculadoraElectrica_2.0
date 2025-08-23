#!/bin/bash

# Script para generar tráfico de prueba para métricas
# Calculadora Eléctrica RD - Desarrollo

echo "🔄 Generando tráfico de prueba para métricas..."
echo "📊 Proyecto: Calculadora Eléctrica RD"
echo "🎯 Objetivo: Generar datos para Prometheus"
echo ""

# Configuración
API_BASE_URL="http://localhost:3000/api"
REQUESTS_PER_ENDPOINT=50
CONCURRENT_REQUESTS=10
DELAY_BETWEEN_BATCHES=2

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para hacer request
make_request() {
    local endpoint=$1
    local method=${2:-GET}
    
    if [ "$method" = "GET" ]; then
        curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL$endpoint" 2>/dev/null
    else
        curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_BASE_URL$endpoint" 2>/dev/null
    fi
}

# Función para generar tráfico a un endpoint
generate_traffic_for_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local count=$3
    
    echo -e "${BLUE}📡 Generando $count requests a $method $endpoint${NC}"
    
    local success_count=0
    local error_count=0
    
    for ((i=1; i<=count; i++)); do
        local status_code=$(make_request "$endpoint" "$method")
        
        if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
            ((success_count++))
        else
            ((error_count++))
        fi
        
        # Mostrar progreso cada 10 requests
        if [ $((i % 10)) -eq 0 ]; then
            echo -e "  ${YELLOW}Progreso: $i/$count${NC}"
        fi
    done
    
    echo -e "  ${GREEN}✅ Exitosos: $success_count${NC}"
    if [ $error_count -gt 0 ]; then
        echo -e "  ${RED}❌ Errores: $error_count${NC}"
    fi
    echo ""
}

# Función para generar tráfico concurrente
generate_concurrent_traffic() {
    local endpoint=$1
    local method=${2:-GET}
    local total_count=$3
    local concurrent=$4
    
    echo -e "${BLUE}🚀 Generando $total_count requests concurrentes ($concurrent simultáneos) a $method $endpoint${NC}"
    
    local success_count=0
    local error_count=0
    
    for ((i=1; i<=total_count; i+=concurrent)); do
        local batch_size=$((total_count - i + 1))
        if [ $batch_size -gt $concurrent ]; then
            batch_size=$concurrent
        fi
        
        # Iniciar requests en paralelo
        for ((j=0; j<batch_size; j++)); do
            (
                local status_code=$(make_request "$endpoint" "$method")
                if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
                    echo "success"
                else
                    echo "error"
                fi
            ) &
        done
        
        # Esperar a que terminen todos los requests del batch
        wait
        
        # Mostrar progreso
        echo -e "  ${YELLOW}Batch completado: $((i + batch_size - 1))/$total_count${NC}"
        
        # Pequeña pausa entre batches
        sleep 0.5
    done
    
    echo -e "  ${GREEN}✅ Tráfico concurrente completado${NC}"
    echo ""
}

# Verificar que la API esté disponible
echo -e "${YELLOW}🔍 Verificando disponibilidad de la API...${NC}"
if ! curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: La API no está disponible en $API_BASE_URL${NC}"
    echo -e "${YELLOW}💡 Asegúrate de que la aplicación esté corriendo${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API disponible${NC}"
echo ""

# Generar tráfico básico
echo -e "${BLUE}📊 Generando tráfico básico...${NC}"
generate_traffic_for_endpoint "/health" "GET" $REQUESTS_PER_ENDPOINT
generate_traffic_for_endpoint "/metrics" "GET" $REQUESTS_PER_ENDPOINT

# Generar tráfico a endpoints de cálculo (si existen)
echo -e "${BLUE}🧮 Generando tráfico a endpoints de cálculo...${NC}"

# Probar endpoints de cálculo (pueden no existir aún)
if curl -s "$API_BASE_URL/calc/preview" > /dev/null 2>&1; then
    generate_traffic_for_endpoint "/calc/preview" "POST" $((REQUESTS_PER_ENDPOINT / 2))
else
    echo -e "${YELLOW}⚠️  Endpoint /calc/preview no disponible aún${NC}"
fi

if curl -s "$API_BASE_URL/calc/commit" > /dev/null 2>&1; then
    generate_traffic_for_endpoint "/calc/commit" "POST" $((REQUESTS_PER_ENDPOINT / 2))
else
    echo -e "${YELLOW}⚠️  Endpoint /calc/commit no disponible aún${NC}"
fi

# Generar tráfico concurrente para simular carga
echo -e "${BLUE}⚡ Generando tráfico concurrente...${NC}"
generate_concurrent_traffic "/health" "GET" $((REQUESTS_PER_ENDPOINT * 2)) $CONCURRENT_REQUESTS

# Generar tráfico con diferentes métodos HTTP
echo -e "${BLUE}🔄 Generando tráfico con diferentes métodos...${NC}"
generate_traffic_for_endpoint "/health" "GET" $((REQUESTS_PER_ENDPOINT / 4))
generate_traffic_for_endpoint "/metrics" "GET" $((REQUESTS_PER_ENDPOINT / 4))

# Simular errores (requests a endpoints inexistentes)
echo -e "${BLUE}🚨 Simulando algunos errores...${NC}"
for i in {1..10}; do
    curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/nonexistent" 2>/dev/null > /dev/null &
done
wait
echo -e "  ${YELLOW}✅ 10 requests a endpoint inexistente generados${NC}"

echo ""
echo -e "${GREEN}🎉 Tráfico de prueba completado!${NC}"
echo ""
echo -e "${BLUE}📊 Próximos pasos:${NC}"
echo "1. Abre Prometheus: http://localhost:9090"
echo "2. Ejecuta consultas como:"
echo "   - sum by (route, method) (rate(http_requests_total[5m]))"
echo "   - histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))"
echo "3. Verifica que las métricas aparezcan en los gráficos"
echo ""
echo -e "${YELLOW}💡 Tip: Ejecuta este script varias veces para generar más datos${NC}"
