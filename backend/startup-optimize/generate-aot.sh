#!/bin/bash

# Script para gerar AOT Cache - Shopping App Backend
# Spring Boot 3.5.5 + Java 21

set -e

# Configurações
AOT_PROFILE="aot"
MAIN_CLASS="com.shopping.ShoppingApplication"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

echo "🚀 Gerando AOT Cache para Shopping App Backend..."

# Verificar Java 21
java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
if [[ ! "$java_version" == 21.* ]]; then
    print_error "Java 21 é necessário para AOT. Versão atual: $java_version"
    exit 1
fi

print_success "Java 21 detectado: $java_version"

# Passo 1: Limpar builds anteriores
print_step "Passo 1: Limpando builds anteriores..."
cd .. && mvn clean && cd startup-optimize

# Passo 2: Compilar com AOT
print_step "Passo 2: Compilando aplicação com AOT processing..."
cd .. && mvn compile -P${AOT_PROFILE} && cd startup-optimize

if [ $? -ne 0 ]; then
    print_error "Falha na compilação AOT"
    exit 1
fi

print_success "Compilação AOT concluída"

# Passo 3: Processar AOT
print_step "Passo 3: Executando processamento AOT..."
cd .. && mvn spring-boot:process-aot -P${AOT_PROFILE} && cd startup-optimize

if [ $? -ne 0 ]; then
    print_error "Falha no processamento AOT"
    exit 1
fi

print_success "Processamento AOT concluído"

# Passo 4: Package com AOT
print_step "Passo 4: Empacotando JAR com AOT..."
cd .. && mvn package -P${AOT_PROFILE} -DskipTests && cd startup-optimize

if [ $? -ne 0 ]; then
    print_error "Falha no empacotamento"
    exit 1
fi

print_success "JAR com AOT criado"

# Verificar arquivos gerados
AOT_JAR="../target/shopping-backend-1.0.0.jar"
AOT_CLASSES_DIR="../target/spring-aot/main/classes"
AOT_SOURCES_DIR="../target/spring-aot/main/sources"

print_step "Verificando arquivos AOT gerados..."

if [ -f "$AOT_JAR" ]; then
    jar_size=$(du -h "$AOT_JAR" | cut -f1)
    print_success "JAR AOT: $AOT_JAR ($jar_size)"
else
    print_error "JAR AOT não encontrado"
fi

if [ -d "$AOT_CLASSES_DIR" ]; then
    aot_classes=$(find "$AOT_CLASSES_DIR" -name "*.class" | wc -l)
    print_success "Classes AOT geradas: $aot_classes"
else
    print_warning "Diretório de classes AOT não encontrado"
fi

if [ -d "$AOT_SOURCES_DIR" ]; then
    aot_sources=$(find "$AOT_SOURCES_DIR" -name "*.java" | wc -l)
    print_success "Fontes AOT geradas: $aot_sources"
else
    print_warning "Diretório de fontes AOT não encontrado"
fi

# Teste rápido
print_step "Testando inicialização com AOT..."
timeout 30s java \
    -Dspring.profiles.active=dev \
    -Dspring.main.web-application-type=none \
    -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
    -jar "$AOT_JAR" || true

print_success "AOT Cache gerado com sucesso!"
echo ""
echo "📊 Resumo:"
echo "   • JAR com AOT: $AOT_JAR"
echo "   • Tamanho: $(du -h "$AOT_JAR" | cut -f1)"
echo "   • Classes AOT: $(find "$AOT_CLASSES_DIR" -name "*.class" 2>/dev/null | wc -l || echo "0")"
echo "   • Fontes AOT: $(find "$AOT_SOURCES_DIR" -name "*.java" 2>/dev/null | wc -l || echo "0")"
echo ""
print_step "Para usar AOT, execute:"
echo "java -jar $AOT_JAR"
