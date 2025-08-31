#!/bin/bash

# Benchmark CDS vs Standard - Shopping App Backend
# Versão corrigida com cálculos precisos

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

print_info "Benchmark CDS vs Standard (3 iterações cada)"

# Função para medir tempo com precisão
measure_time() {
    local mode=$1
    local times=()
    local total=0
    
    for i in 1 2 3; do
        echo -n "  Teste $i/3... "
        
        if [ "$mode" = "cds" ]; then
            start=$(date +%s.%N)
            timeout 30s java \
                -Xshare:on \
                -XX:SharedArchiveFile="$CDS_ARCHIVE" \
                -XX:+UseG1GC \
                -Dspring.profiles.active=dev \
                -Dspring.main.web-application-type=none \
                -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
                -jar "$APP_JAR" > /dev/null 2>&1 || true
            end=$(date +%s.%N)
        else
            start=$(date +%s.%N)
            timeout 30s java \
                -XX:+UseG1GC \
                -Dspring.profiles.active=dev \
                -Dspring.main.web-application-type=none \
                -Dspring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration \
                -jar "$APP_JAR" > /dev/null 2>&1 || true
            end=$(date +%s.%N)
        fi
        
        # Calcular tempo com precisão usando awk
        time_taken=$(awk "BEGIN {printf \"%.3f\", $end - $start}")
        times+=($time_taken)
        total=$(awk "BEGIN {printf \"%.3f\", $total + $time_taken}")
        
        echo "${time_taken}s"
    done
    
    # Calcular média
    avg=$(awk "BEGIN {printf \"%.3f\", $total / 3}")
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

# Calcular melhoria usando awk
improvement=$(awk "BEGIN {
    if ($time_standard > $time_cds) {
        diff = $time_standard - $time_cds
        percent = (diff / $time_standard) * 100
        printf \"%.1f\", percent
    } else {
        print \"0\"
    }
}")

speedup=$(awk "BEGIN {
    if ($time_cds > 0) {
        printf \"%.2f\", $time_standard / $time_cds
    } else {
        print \"1.00\"
    }
}")

if (( $(awk "BEGIN {print ($time_standard > $time_cds)}") )); then
    diff=$(awk "BEGIN {printf \"%.3f\", $time_standard - $time_cds}")
    echo "   • Melhoria: ${diff}s mais rápido (${improvement}%)"
    echo "   • Speedup: ${speedup}x"
    echo "   • Status: ✅ CDS melhorou a performance"
elif (( $(awk "BEGIN {print ($time_cds > $time_standard)}") )); then
    diff=$(awk "BEGIN {printf \"%.3f\", $time_cds - $time_standard}")
    echo "   • Diferença: ${diff}s mais lento"
    echo "   • Status: ⚠️  CDS não melhorou significativamente"
else
    echo "   • Status: ➖ Performance similar"
fi

echo ""
echo "📋 Informações:"
echo "   • CDS Archive: $(du -h "$CDS_ARCHIVE" | cut -f1)"
echo "   • JAR Size: $(du -h "$APP_JAR" | cut -f1)"
echo "   • Classes: $(wc -l < ../shopping-classes.lst 2>/dev/null || echo "N/A")"

# Salvar resultados em CSV
echo "timestamp,mode,time_seconds" > benchmark-cds-results.csv
echo "$(date '+%Y-%m-%d %H:%M:%S'),standard,$time_standard" >> benchmark-cds-results.csv
echo "$(date '+%Y-%m-%d %H:%M:%S'),cds,$time_cds" >> benchmark-cds-results.csv

echo ""
echo "📄 Resultados salvos em: benchmark-cds-results.csv"
