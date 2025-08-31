#!/bin/bash

# Script otimizado para inicialização com AOT Cache
# Shopping App Backend - Java 21 + Spring Boot 3.5.5

set -e

# Configurações
APP_JAR="../target/shopping-backend-1.0.0.jar"
PROFILE="${SPRING_PROFILES_ACTIVE:-dev}"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

# Verificar se JAR existe
if [ ! -f "$APP_JAR" ]; then
    print_error "JAR não encontrado: $APP_JAR"
    print_info "Execute 'cd startup-optimize && ./generate-aot.sh' primeiro para gerar o JAR com AOT"
    exit 1
fi

print_info "Iniciando Shopping App Backend com AOT Cache..."
print_info "Profile: $PROFILE"
print_info "JAR: $APP_JAR"

# JVM Options otimizadas para AOT + Java 21
exec java \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -XX:+UseCompressedOops \
    -XX:+UseCompressedClassPointers \
    -Xms512m \
    -Xmx1g \
    -XX:NewRatio=2 \
    -XX:G1HeapRegionSize=16m \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UnlockExperimentalVMOptions \
    -XX:G1NewSizePercent=20 \
    -XX:G1MaxNewSizePercent=40 \
    -XX:InitiatingHeapOccupancyPercent=45 \
    -XX:G1MixedGCCountTarget=8 \
    -XX:G1MixedGCLiveThresholdPercent=85 \
    -Dspring.profiles.active="$PROFILE" \
    -Dspring.output.ansi.enabled=always \
    -Dlogging.level.com.shopping=INFO \
    -Dserver.shutdown=graceful \
    -Dspring.lifecycle.timeout-per-shutdown-phase=30s \
    -Dspring.aot.enabled=true \
    -jar "$APP_JAR" \
    "$@"
