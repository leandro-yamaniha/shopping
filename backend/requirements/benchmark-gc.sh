#!/bin/bash

# Script de Benchmark: G1GC vs ZGC Performance Comparison
# Autor: Performance Testing Suite
# Data: $(date)

set -e

echo "🚀 Iniciando Benchmark G1GC vs ZGC"
echo "=================================="

# Configurações do teste
WARMUP_REQUESTS=50
BENCHMARK_REQUESTS=200
CONCURRENT_USERS=10
TEST_DURATION=60

# URLs para teste
HEALTH_URL="http://localhost:8080/actuator/health"
METRICS_URL="http://localhost:8080/actuator/metrics"
API_URL="http://localhost:8080/api"

# Criar diretórios para logs
mkdir -p logs heapdumps/g1gc heapdumps/zgc results

# Função para executar benchmark
run_benchmark() {
    local gc_type=$1
    local jvm_opts_file=$2
    local result_file=$3
    
    echo "📊 Testando $gc_type..."
    echo "========================"
    
    # Parar aplicação se estiver rodando
    pkill -f "com.shopping.ShoppingApplication" 2>/dev/null || true
    sleep 3
    
    # Copiar configuração JVM específica
    cp "$jvm_opts_file" .jvmopts
    
    # Iniciar aplicação com configuração específica
    echo "🔄 Iniciando aplicação com $gc_type..."
    JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
    PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH" \
    nohup mvn spring-boot:run > "logs/app-$gc_type.log" 2>&1 &
    
    APP_PID=$!
    echo "📱 Aplicação iniciada (PID: $APP_PID)"
    
    # Aguardar inicialização
    echo "⏳ Aguardando inicialização..."
    for i in {1..30}; do
        if curl -s "$HEALTH_URL" > /dev/null 2>&1; then
            echo "✅ Aplicação pronta após ${i}s"
            break
        fi
        sleep 1
    done
    
    # Warmup
    echo "🔥 Executando warmup ($WARMUP_REQUESTS requisições)..."
    for i in $(seq 1 $WARMUP_REQUESTS); do
        curl -s "$HEALTH_URL" > /dev/null 2>&1 || true
    done
    
    sleep 5
    
    # Coletar métricas iniciais
    echo "📈 Coletando métricas iniciais..."
    curl -s "$METRICS_URL/jvm.gc.pause" | jq . > "results/gc-initial-$gc_type.json" 2>/dev/null || true
    curl -s "$METRICS_URL/jvm.memory.used" | jq . > "results/memory-initial-$gc_type.json" 2>/dev/null || true
    
    # Benchmark principal
    echo "🏁 Executando benchmark ($BENCHMARK_REQUESTS requisições)..."
    
    # Arquivo para resultados
    echo "timestamp,response_time,status_code" > "$result_file"
    
    # Executar requisições e medir tempos
    for i in $(seq 1 $BENCHMARK_REQUESTS); do
        start_time=$(date +%s.%N)
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
        end_time=$(date +%s.%N)
        
        response_time=$(echo "$end_time - $start_time" | bc -l)
        timestamp=$(date +%s.%N)
        
        echo "$timestamp,$response_time,$status_code" >> "$result_file"
        
        # Progresso
        if [ $((i % 20)) -eq 0 ]; then
            echo "  Progresso: $i/$BENCHMARK_REQUESTS requisições"
        fi
    done
    
    # Coletar métricas finais
    echo "📊 Coletando métricas finais..."
    curl -s "$METRICS_URL/jvm.gc.pause" | jq . > "results/gc-final-$gc_type.json" 2>/dev/null || true
    curl -s "$METRICS_URL/jvm.memory.used" | jq . > "results/memory-final-$gc_type.json" 2>/dev/null || true
    curl -s "$METRICS_URL/http.server.requests" | jq . > "results/http-requests-$gc_type.json" 2>/dev/null || true
    
    # Parar aplicação
    echo "🛑 Parando aplicação..."
    pkill -f "com.shopping.ShoppingApplication" 2>/dev/null || true
    sleep 3
    
    echo "✅ Teste $gc_type concluído!"
    echo ""
}

# Função para analisar resultados
analyze_results() {
    local gc_type=$1
    local result_file=$2
    
    echo "📊 Análise $gc_type:"
    echo "==================="
    
    # Calcular estatísticas usando awk
    awk -F',' 'NR>1 {
        times[NR-1] = $2
        if ($2 < min || min == "") min = $2
        if ($2 > max) max = $2
        sum += $2
        count++
    } 
    END {
        avg = sum/count
        
        # Calcular percentis (aproximado)
        asort(times)
        p50 = times[int(count*0.5)]
        p95 = times[int(count*0.95)]
        p99 = times[int(count*0.99)]
        
        printf "  Requisições: %d\n", count
        printf "  Tempo médio: %.3fs\n", avg
        printf "  Tempo mínimo: %.3fs\n", min
        printf "  Tempo máximo: %.3fs\n", max
        printf "  P50: %.3fs\n", p50
        printf "  P95: %.3fs\n", p95
        printf "  P99: %.3fs\n", p99
        printf "  Throughput: %.1f req/s\n", count/sum
    }' "$result_file"
    
    echo ""
}

# Executar testes
echo "🎯 Iniciando testes de performance..."
echo ""

# Teste 1: G1GC
run_benchmark "G1GC" ".jvmopts-g1gc" "results/benchmark-g1gc.csv"

# Aguardar entre testes
echo "⏸️  Pausa entre testes (10s)..."
sleep 10

# Teste 2: ZGC
run_benchmark "ZGC" ".jvmopts-zgc" "results/benchmark-zgc.csv"

# Análise dos resultados
echo "🎉 Benchmark concluído! Analisando resultados..."
echo "================================================"
echo ""

analyze_results "G1GC" "results/benchmark-g1gc.csv"
analyze_results "ZGC" "results/benchmark-zgc.csv"

# Comparação final
echo "🏆 COMPARAÇÃO FINAL:"
echo "==================="
echo ""

# Calcular diferenças percentuais
g1_avg=$(awk -F',' 'NR>1 {sum+=$2; count++} END {print sum/count}' results/benchmark-g1gc.csv)
zgc_avg=$(awk -F',' 'NR>1 {sum+=$2; count++} END {print sum/count}' results/benchmark-zgc.csv)

improvement=$(echo "scale=2; (($g1_avg - $zgc_avg) / $g1_avg) * 100" | bc -l)

echo "G1GC tempo médio: ${g1_avg}s"
echo "ZGC tempo médio: ${zgc_avg}s"

if (( $(echo "$improvement > 0" | bc -l) )); then
    echo "🚀 ZGC é ${improvement}% mais rápido que G1GC"
else
    improvement=$(echo "scale=2; (($zgc_avg - $g1_avg) / $zgc_avg) * 100" | bc -l)
    echo "🐌 G1GC é ${improvement}% mais rápido que ZGC"
fi

echo ""
echo "📁 Logs e resultados salvos em:"
echo "  - logs/gc-g1.log (G1GC logs)"
echo "  - logs/gc-zgc.log (ZGC logs)"
echo "  - results/benchmark-*.csv (Dados de performance)"
echo "  - results/*-*.json (Métricas JVM)"
echo ""
echo "✅ Benchmark G1GC vs ZGC concluído com sucesso!"
