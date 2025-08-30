#!/bin/bash

# Benchmark simples para CDS - Shopping App Backend
# Evita problemas com bc/awk usando apenas shell básico

set -e

APP_JAR="../target/shopping-backend-1.0.0.jar"
CDS_ARCHIVE="../shopping-app.jsa"

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
if [ ! -f "$APP_JAR" ]; then
    echo "❌ JAR não encontrado: $APP_JAR"
    exit 1
fi

if [ ! -f "$CDS_ARCHIVE" ]; then
    echo "❌ CDS não encontrado: $CDS_ARCHIVE"
    echo "Execute: cd startup-optimize && ./generate-cds.sh"
    exit 1
fi

print_info "Benchmark CDS vs Padrão (3 iterações cada)"

# Função para medir tempo
measure_time() {
    local mode=$1
    local total=0
    
    for i in 1 2 3; do
        echo -n "  Teste $i/3... "
        
        if [ "$mode" = "cds" ]; then
            start=$(date +%s)
            timeout 30s java \
                -Xshare:on \
                -XX:SharedArchiveFile="$CDS_ARCHIVE" \
                -XX:+UseG1GC \
                -Dspring.profiles.active=dev \
                -Dspring.main.web-application-type=none \
                -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
                -jar "$APP_JAR" > /dev/null 2>&1 || true
            end=$(date +%s)
        else
            start=$(date +%s)
            timeout 30s java \
                -XX:+UseG1GC \
                -Dspring.profiles.active=dev \
                -Dspring.main.web-application-type=none \
                -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
                -jar "$APP_JAR" > /dev/null 2>&1 || true
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
print_info "Testando sem CDS..."
time_standard=$(measure_time "standard")

print_info "Testando com CDS..."
time_cds=$(measure_time "cds")

# Resultados
print_success "Benchmark concluído!"
echo ""
echo "📈 Resultados:"
echo "   • Tempo médio sem CDS: ${time_standard}s"
echo "   • Tempo médio com CDS: ${time_cds}s"

# Calcular melhoria simples
if [ "$time_standard" -gt "$time_cds" ]; then
    diff=$((time_standard - time_cds))
    echo "   • Melhoria: ${diff}s mais rápido"
    echo "   • Status: ✅ CDS melhorou a performance"
elif [ "$time_cds" -gt "$time_standard" ]; then
    diff=$((time_cds - time_standard))
    echo "   • Diferença: ${diff}s mais lento"
    echo "   • Status: ⚠️  CDS não melhorou significativamente"
else
    echo "   • Status: ➖ Performance similar"
fi

echo ""
echo "📋 Informações:"
echo "   • CDS Archive: $(du -h "$CDS_ARCHIVE" | cut -f1)"
echo "   • Classes: $(wc -l < shopping-classes.lst 2>/dev/null || echo "N/A")"
