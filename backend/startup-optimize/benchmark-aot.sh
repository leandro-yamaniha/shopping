#!/bin/bash

# Benchmark AOT vs Standard - Shopping App Backend
# Compara performance entre JAR padrão e JAR com AOT

set -e

STANDARD_JAR="../target/shopping-backend-1.0.0.jar"
AOT_JAR="../target/shopping-backend-1.0.0.jar"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}📊 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Verificar arquivos
if [ ! -f "$STANDARD_JAR" ]; then
    echo "❌ JAR não encontrado: $STANDARD_JAR"
    exit 1
fi

print_info "Benchmark AOT vs Standard (3 iterações cada)"

# Função para medir tempo
measure_time() {
    local mode=$1
    local total=0
    
    for i in 1 2 3; do
        echo -n "  Teste $i/3... "
        
        if [ "$mode" = "aot" ]; then
            start=$(date +%s)
            timeout 30s java \
                -Dspring.aot.enabled=true \
                -XX:+UseG1GC \
                -Dspring.profiles.active=dev \
                -Dspring.main.web-application-type=none \
                -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
                -jar "$AOT_JAR" > /dev/null 2>&1 || true
            end=$(date +%s)
        else
            start=$(date +%s)
            timeout 30s java \
                -XX:+UseG1GC \
                -Dspring.profiles.active=dev \
                -Dspring.main.web-application-type=none \
                -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
                -jar "$STANDARD_JAR" > /dev/null 2>&1 || true
            end=$(date +%s)
        fi
        
        time_taken=$((end - start))
        total=$((total + time_taken))
        echo "${time_taken}s"
    done
    
    # Média simples
    avg=$((total / 3))
    echo "$avg"
}

# Executar testes
print_info "Testando modo Standard..."
time_standard=$(measure_time "standard")

print_info "Testando modo AOT..."
time_aot=$(measure_time "aot")

# Resultados
print_success "Benchmark concluído!"
echo ""
echo "📈 Resultados:"
echo "   • Tempo médio Standard: ${time_standard}s"
echo "   • Tempo médio AOT: ${time_aot}s"

# Calcular melhoria
if [ "$time_standard" -gt "$time_aot" ]; then
    diff=$((time_standard - time_aot))
    echo "   • Melhoria: ${diff}s mais rápido"
    echo "   • Status: ✅ AOT melhorou a performance"
elif [ "$time_aot" -gt "$time_standard" ]; then
    diff=$((time_aot - time_standard))
    echo "   • Diferença: ${diff}s mais lento"
    echo "   • Status: ⚠️  AOT não melhorou significativamente"
else
    echo "   • Status: ➖ Performance similar"
fi

echo ""
echo "📋 Informações:"
echo "   • JAR Size: $(du -h "$STANDARD_JAR" | cut -f1)"
echo "   • AOT Classes: $(find ../target/spring-aot/main/classes -name "*.class" 2>/dev/null | wc -l || echo "0")"
