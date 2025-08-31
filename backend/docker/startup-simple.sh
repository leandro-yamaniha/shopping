#!/bin/bash

# Script de inicialização simples para Docker
# Shopping App Backend - Java 21 + Spring Boot 3.5.5 + Layered JARs

set -e

# Configurações
PROFILE="${SPRING_PROFILES_ACTIVE:-docker}"

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

# Verificar se as classes do Spring Boot estão presentes (layered JAR)
if [ ! -d "org" ]; then
    print_error "Classes da aplicação não encontradas (layered JAR)"
    exit 1
fi

print_info "Iniciando Shopping App Backend com Layered JARs..."
print_info "Profile: $PROFILE"

# JVM Options otimizadas para Java 21 + Docker
exec java \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -XX:+UseCompressedOops \
    -XX:+UseCompressedClassPointers \
    -Xms256m \
    -Xmx512m \
    -XX:NewRatio=2 \
    -XX:G1HeapRegionSize=8m \
    -XX:MaxGCPauseMillis=100 \
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
    -cp "/app" \
    org.springframework.boot.loader.launch.JarLauncher \
    "$@"
