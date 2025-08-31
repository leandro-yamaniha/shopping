#!/bin/bash

# Script para gerar Class Data Sharing (CDS) para Shopping App Backend
# Otimiza o tempo de inicialização da aplicação Spring Boot

set -e

echo "🚀 Gerando configuração CDS para Shopping App Backend..."

# Configurações
APP_JAR="../target/shopping-backend-1.0.0.jar"
CDS_ARCHIVE="../shopping-app.jsa"
CLASS_LIST="../shopping-classes.lst"
MAIN_CLASS="com.shopping.ShoppingApplication"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Verificar se o JAR existe
if [ ! -f "$APP_JAR" ]; then
    print_error "JAR não encontrado: $APP_JAR"
    print_step "Compilando aplicação..."
    cd .. && mvn clean package -DskipTests && cd startup-optimize
    
    if [ ! -f "$APP_JAR" ]; then
        print_error "Falha ao compilar aplicação"
        exit 1
    fi
fi

print_success "JAR encontrado: $APP_JAR"

# Passo 1: Gerar lista de classes carregadas
print_step "Passo 1: Gerando lista de classes carregadas..."

# Remover arquivos antigos
rm -f "$CLASS_LIST" "$CDS_ARCHIVE"

# Executar aplicação em modo de treinamento para capturar classes
timeout 60s java \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -XX:DumpLoadedClassList="$CLASS_LIST" \
    -Dspring.profiles.active=dev \
    -Dspring.main.web-application-type=none \
    -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
    -jar "$APP_JAR" || true

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
    -cp "$APP_JAR"

if [ ! -f "$CDS_ARCHIVE" ]; then
    print_error "Falha ao criar arquivo CDS"
    exit 1
fi

print_success "Arquivo CDS criado: $CDS_ARCHIVE ($(du -h "$CDS_ARCHIVE" | cut -f1))"

# Passo 3: Testar CDS
print_step "Passo 3: Testando configuração CDS..."

echo "Testando inicialização sem CDS..."
time_without_cds=$(timeout 30s time -p java \
    -XX:+UseG1GC \
    -Dspring.profiles.active=dev \
    -Dspring.main.web-application-type=none \
    -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
    -jar "$APP_JAR" 2>&1 | grep real | awk '{print $2}' || echo "30.0")

echo "Testando inicialização com CDS..."
time_with_cds=$(timeout 30s time -p java \
    -Xshare:on \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseG1GC \
    -XX:SharedArchiveFile="$CDS_ARCHIVE" \
    -Dspring.profiles.active=dev \
    -Dspring.main.web-application-type=none \
    -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
    -jar "$APP_JAR" 2>&1 | grep real | awk '{print $2}' || echo "30.0")

print_success "Configuração CDS criada com sucesso!"
echo ""
echo "📊 Resultados:"
echo "   • Classes capturadas: $(wc -l < "$CLASS_LIST")"
echo "   • Tamanho do arquivo CDS: $(du -h "$CDS_ARCHIVE" | cut -f1)"
echo "   • Tempo sem CDS: ${time_without_cds}s"
echo "   • Tempo com CDS: ${time_with_cds}s"

# Calcular melhoria
if command -v bc >/dev/null 2>&1; then
    improvement=$(echo "scale=1; ($time_without_cds - $time_with_cds) / $time_without_cds * 100" | bc)
    echo "   • Melhoria: ${improvement}%"
fi

echo ""
print_step "Para usar CDS, execute a aplicação com:"
echo "java -Xshare:on -XX:SharedArchiveFile=$CDS_ARCHIVE -jar $APP_JAR"

echo ""
print_step "Arquivos gerados:"
echo "   • $CLASS_LIST - Lista de classes"
echo "   • $CDS_ARCHIVE - Arquivo CDS"
