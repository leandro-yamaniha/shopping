#!/bin/bash

# Script para gerar Class Data Sharing (CDS) em Docker Build
# Shopping App Backend - Java 21 + Spring Boot 3.5.5

set -e

echo "🚀 Gerando configuração CDS para Docker Build..."

# Configurações para Docker runtime context (layered JAR)
APP_CLASSPATH="/app/*"
CDS_ARCHIVE="shopping-app.jsa"
CLASS_LIST="shopping-classes.lst"
MAIN_CLASS="com.shopping.ShoppingApplication"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se as classes do Spring Boot estão presentes (layered JAR)
if [ ! -d "org" ]; then
    print_error "Classes da aplicação não encontradas (layered JAR)"
    exit 1
fi

print_success "Classes da aplicação encontradas (layered JAR)"

# Passo 1: Gerar lista de classes carregadas
print_step "Passo 1: Gerando lista de classes carregadas..."

# Remover arquivos antigos
rm -f "$CLASS_LIST" "$CDS_ARCHIVE"

# Executar aplicação em modo de treinamento para capturar classes
# Usar timeout do coreutils e configuração mínima para Docker
timeout 45s java \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseG1GC \
    -XX:DumpLoadedClassList="$CLASS_LIST" \
    -Dspring.profiles.active=cds-generation \
    -Dspring.main.web-application-type=none \
    -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration,org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration \
    -Dspring.datasource.url=jdbc:h2:mem:testdb \
    -Dspring.datasource.driver-class-name=org.h2.Driver \
    -Dspring.jpa.hibernate.ddl-auto=none \
    -Dlogging.level.root=WARN \
    -Dlogging.level.org.springframework=WARN \
    -Dlogging.level.org.hibernate=WARN \
    -cp "$APP_CLASSPATH" \
    "$MAIN_CLASS" || true

if [ ! -f "$CLASS_LIST" ]; then
    print_error "Falha ao gerar lista de classes"
    exit 1
fi

print_success "Lista de classes gerada: $CLASS_LIST ($(wc -l < "$CLASS_LIST") classes)"

# Passo 2: Criar arquivo CDS
print_step "Passo 2: Criando arquivo CDS..."

java \
    -Xshare:dump \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseG1GC \
    -XX:SharedClassListFile="$CLASS_LIST" \
    -XX:SharedArchiveFile="$CDS_ARCHIVE" \
    -cp "$APP_CLASSPATH"

if [ ! -f "$CDS_ARCHIVE" ]; then
    print_error "Falha ao criar arquivo CDS"
    exit 1
fi

print_success "Arquivo CDS criado: $CDS_ARCHIVE ($(du -h "$CDS_ARCHIVE" | cut -f1))"

# Passo 3: Validação básica
print_step "Passo 3: Validando arquivo CDS..."

# Verificar se o arquivo CDS é válido (tamanho mínimo)
cds_size=$(stat -c%s "$CDS_ARCHIVE" 2>/dev/null || echo "0")
if [ "$cds_size" -gt 1000000 ]; then  # > 1MB
    print_success "Arquivo CDS válido (${cds_size} bytes)"
else
    print_error "Arquivo CDS muito pequeno ou inválido"
    exit 1
fi

echo ""
echo "📊 Resultados:"
echo "   • Classes capturadas: $(wc -l < "$CLASS_LIST")"
echo "   • Tamanho do arquivo CDS: $(du -h "$CDS_ARCHIVE" | cut -f1)"

echo ""
print_step "Arquivos gerados:"
echo "   • $CLASS_LIST - Lista de classes"
echo "   • $CDS_ARCHIVE - Arquivo CDS"
