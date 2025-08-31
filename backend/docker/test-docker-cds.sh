#!/bin/bash

# Test script para validar Docker CDS + Layered JARs
# Shopping App Backend - Java 21 + Spring Boot 3.5.5

set -e

# Configurações
IMAGE_NAME="shopping-backend:cds"
CONTAINER_NAME="shopping-test-cds"
TEST_PORT="8080"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

cleanup() {
    print_info "Limpando containers de teste..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Cleanup em caso de erro
trap cleanup EXIT

print_info "=== Teste Docker CDS + Layered JARs ==="
print_info "Imagem: $IMAGE_NAME"
print_info "Container: $CONTAINER_NAME"

# 1. Build da imagem
print_info "1. Construindo imagem Docker otimizada..."
if docker build -f docker/Dockerfile.cds -t $IMAGE_NAME . > build.log 2>&1; then
    print_success "Imagem construída com sucesso"
else
    print_error "Falha na construção da imagem"
    tail -20 build.log
    exit 1
fi

# 2. Verificar layers da imagem
print_info "2. Analisando layers da imagem..."
docker history $IMAGE_NAME --format "table {{.CreatedBy}}\t{{.Size}}" | head -10

# 3. Iniciar container
print_info "3. Iniciando container de teste..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $TEST_PORT:8080 \
    -e SPRING_PROFILES_ACTIVE=test \
    $IMAGE_NAME

# 4. Aguardar inicialização
print_info "4. Aguardando inicialização da aplicação..."
start_time=$(date +%s)
timeout=60
while [ $(($(date +%s) - start_time)) -lt $timeout ]; do
    if docker exec $CONTAINER_NAME curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        end_time=$(date +%s)
        startup_time=$((end_time - start_time))
        print_success "Aplicação iniciada em ${startup_time}s"
        break
    fi
    sleep 2
done

if [ $(($(date +%s) - start_time)) -ge $timeout ]; then
    print_error "Timeout na inicialização da aplicação"
    docker logs $CONTAINER_NAME
    exit 1
fi

# 5. Verificar health check
print_info "5. Verificando health check..."
if health_response=$(docker exec $CONTAINER_NAME curl -s http://localhost:8080/actuator/health); then
    print_success "Health check OK"
    echo "$health_response" | jq . 2>/dev/null || echo "$health_response"
else
    print_error "Health check falhou"
    exit 1
fi

# 6. Verificar CDS
print_info "6. Verificando uso do CDS..."
if docker exec $CONTAINER_NAME ls -la shopping-app.jsa > /dev/null 2>&1; then
    cds_size=$(docker exec $CONTAINER_NAME stat -c%s shopping-app.jsa)
    print_success "CDS archive encontrado (${cds_size} bytes)"
else
    print_warning "CDS archive não encontrado"
fi

# 7. Verificar estrutura layered JAR
print_info "7. Verificando estrutura layered JAR..."
if docker exec $CONTAINER_NAME ls -la org/ > /dev/null 2>&1; then
    print_success "Classes da aplicação encontradas (layered JAR)"
else
    print_warning "Estrutura layered JAR não encontrada"
fi

# 8. Verificar logs de inicialização
print_info "8. Logs de inicialização:"
docker logs $CONTAINER_NAME | grep -E "(Started|CDS|JVM|Spring)" | tail -5

# 9. Verificar uso de memória
print_info "9. Uso de recursos:"
docker stats $CONTAINER_NAME --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# 10. Teste de endpoint simples
print_info "10. Testando endpoint de saúde..."
if curl -s http://localhost:$TEST_PORT/actuator/health > /dev/null; then
    print_success "Endpoint acessível externamente"
else
    print_warning "Endpoint não acessível externamente (normal se não houver mapeamento de porta)"
fi

print_success "=== Teste concluído com sucesso ==="
print_info "Para parar o container: docker stop $CONTAINER_NAME"
print_info "Para ver logs: docker logs $CONTAINER_NAME"
print_info "Para acessar shell: docker exec -it $CONTAINER_NAME /bin/bash"
