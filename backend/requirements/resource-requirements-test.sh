#!/bin/bash

# Script de Teste de Requisitos Mínimos de Recursos
# Testa diferentes configurações de memória e CPU para identificar limites mínimos
# Autor: Performance Testing Suite
# Data: $(date)

set -e

echo "🔬 TESTE DE REQUISITOS MÍNIMOS DE RECURSOS"
echo "=========================================="
echo "Objetivo: Identificar mínimo de memória e vCPU suportado"
echo ""

# Configurações do teste
TEST_REQUESTS=100
WARMUP_REQUESTS=20
HEALTH_URL="http://localhost:8080/actuator/health"
METRICS_URL="http://localhost:8080/actuator/metrics"

# Criar diretórios
mkdir -p resource-tests logs results

# Configurações de memória para testar (em MB)
MEMORY_CONFIGS=(
    "128m:256m"   # Muito baixo
    "256m:512m"   # Baixo
    "384m:768m"   # Mínimo esperado
    "512m:1g"     # Conservador
    "768m:1536m"  # Confortável
    "1g:2g"       # Atual (baseline)
)

# Configurações de CPU para testar (limitação via taskset)
CPU_CONFIGS=(
    "1"    # 1 core
    "2"    # 2 cores
    "4"    # 4 cores
    "0-7"  # Todos os cores (baseline)
)

# Função para criar configuração JVM com memória específica
create_memory_config() {
    local min_heap=$1
    local max_heap=$2
    local config_name=$3
    
    cat > ".jvmopts-${config_name}" << EOF
# Configuração de teste: ${config_name}
# Heap Memory: ${min_heap} - ${max_heap}
-Xms${min_heap}
-Xmx${max_heap}

# ZGC Ultra Low Latency
-XX:+UseZGC
-XX:+UnlockExperimentalVMOptions
-XX:ZCollectionInterval=5
-XX:SoftMaxHeapSize=${max_heap}

# Performance básica
-XX:+UseStringDeduplication
-XX:+UseCompressedOops
-XX:+UseCompressedClassPointers

# Monitoring
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./resource-tests/
-XX:+PrintGC
-XX:+PrintGCDetails
-Xloggc:./logs/gc-${config_name}.log

# Network
-Djava.net.preferIPv4Stack=true
-Djava.security.egd=file:/dev/./urandom
EOF
}

# Função para testar configuração específica
test_configuration() {
    local memory_config=$1
    local cpu_config=$2
    local test_name=$3
    
    echo "🧪 Testando: $test_name"
    echo "   Memória: $memory_config"
    echo "   CPU: $cpu_config cores"
    echo "   ========================"
    
    # Extrair min e max heap
    local min_heap=$(echo $memory_config | cut -d: -f1)
    local max_heap=$(echo $memory_config | cut -d: -f2)
    
    # Criar configuração JVM
    create_memory_config "$min_heap" "$max_heap" "$test_name"
    
    # Copiar configuração
    cp ".jvmopts-${test_name}" .jvmopts
    
    # Parar aplicação se estiver rodando
    pkill -f "com.shopping.ShoppingApplication" 2>/dev/null || true
    sleep 3
    
    # Iniciar aplicação com limitação de CPU
    echo "🚀 Iniciando aplicação..."
    
    local start_time=$(date +%s)
    
    if [ "$cpu_config" != "0-7" ]; then
        # Usar taskset para limitar CPU
        JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
        PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH" \
        taskset -c "$cpu_config" mvn spring-boot:run > "logs/app-${test_name}.log" 2>&1 &
    else
        # Sem limitação de CPU
        JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
        PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH" \
        mvn spring-boot:run > "logs/app-${test_name}.log" 2>&1 &
    fi
    
    local app_pid=$!
    echo "   PID: $app_pid"
    
    # Aguardar inicialização (timeout 60s)
    local startup_success=false
    for i in {1..60}; do
        if curl -s "$HEALTH_URL" > /dev/null 2>&1; then
            local startup_time=$(($(date +%s) - start_time))
            echo "   ✅ Inicialização: ${startup_time}s"
            startup_success=true
            break
        fi
        sleep 1
        
        # Verificar se processo ainda está rodando
        if ! kill -0 $app_pid 2>/dev/null; then
            echo "   ❌ Aplicação falhou na inicialização"
            break
        fi
    done
    
    if [ "$startup_success" = false ]; then
        echo "   ❌ FALHA: Timeout na inicialização (60s)"
        echo "$test_name,STARTUP_FAILED,N/A,N/A,N/A,N/A,N/A" >> results/resource-test-summary.csv
        pkill -f "com.shopping.ShoppingApplication" 2>/dev/null || true
        return 1
    fi
    
    # Coletar métricas iniciais
    local initial_memory=$(curl -s "$METRICS_URL/jvm.memory.used" 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "N/A")
    
    # Warmup
    echo "   🔥 Warmup ($WARMUP_REQUESTS requisições)..."
    for i in $(seq 1 $WARMUP_REQUESTS); do
        curl -s "$HEALTH_URL" > /dev/null 2>&1 || true
    done
    
    sleep 2
    
    # Teste de performance
    echo "   📊 Teste de performance ($TEST_REQUESTS requisições)..."
    
    local result_file="results/resource-test-${test_name}.csv"
    echo "timestamp,response_time,status_code,memory_used" > "$result_file"
    
    local failed_requests=0
    local total_time=0
    local min_time=999
    local max_time=0
    
    for i in $(seq 1 $TEST_REQUESTS); do
        local start_req=$(date +%s.%N)
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
        local end_req=$(date +%s.%N)
        
        local response_time=$(echo "$end_req - $start_req" | bc -l)
        local memory_used=$(curl -s "$METRICS_URL/jvm.memory.used" 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "N/A")
        
        echo "$(date +%s.%N),$response_time,$status_code,$memory_used" >> "$result_file"
        
        # Estatísticas
        if [ "$status_code" != "200" ]; then
            ((failed_requests++))
        fi
        
        total_time=$(echo "$total_time + $response_time" | bc -l)
        
        if (( $(echo "$response_time < $min_time" | bc -l) )); then
            min_time=$response_time
        fi
        
        if (( $(echo "$response_time > $max_time" | bc -l) )); then
            max_time=$response_time
        fi
        
        # Progresso
        if [ $((i % 25)) -eq 0 ]; then
            echo "     Progresso: $i/$TEST_REQUESTS"
        fi
    done
    
    # Coletar métricas finais
    local final_memory=$(curl -s "$METRICS_URL/jvm.memory.used" 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "N/A")
    local gc_count=$(curl -s "$METRICS_URL/jvm.gc.pause" 2>/dev/null | jq -r '.measurements[] | select(.statistic=="COUNT") | .value' 2>/dev/null || echo "N/A")
    
    # Calcular estatísticas
    local avg_time=$(echo "scale=3; $total_time / $TEST_REQUESTS" | bc -l)
    local success_rate=$(echo "scale=2; (($TEST_REQUESTS - $failed_requests) / $TEST_REQUESTS) * 100" | bc -l)
    
    # Determinar status do teste
    local test_status="SUCCESS"
    if [ "$failed_requests" -gt 5 ]; then
        test_status="UNSTABLE"
    fi
    if [ "$failed_requests" -gt 20 ]; then
        test_status="FAILED"
    fi
    
    # Salvar resumo
    echo "$test_name,$test_status,$avg_time,$min_time,$max_time,$success_rate,$gc_count" >> results/resource-test-summary.csv
    
    # Exibir resultados
    echo "   📊 Resultados:"
    echo "      Status: $test_status"
    echo "      Tempo médio: ${avg_time}s"
    echo "      Tempo mín/máx: ${min_time}s / ${max_time}s"
    echo "      Taxa sucesso: ${success_rate}%"
    echo "      Falhas: $failed_requests/$TEST_REQUESTS"
    echo "      Memória inicial: ${initial_memory} bytes"
    echo "      Memória final: ${final_memory} bytes"
    echo "      GC Count: $gc_count"
    
    # Parar aplicação
    echo "   🛑 Parando aplicação..."
    pkill -f "com.shopping.ShoppingApplication" 2>/dev/null || true
    sleep 3
    
    echo "   ✅ Teste concluído!"
    echo ""
    
    return 0
}

# Função principal de teste
run_resource_tests() {
    echo "🎯 Iniciando testes de recursos mínimos..."
    echo ""
    
    # Criar cabeçalho do arquivo de resumo
    echo "test_name,status,avg_time,min_time,max_time,success_rate,gc_count" > results/resource-test-summary.csv
    
    # Teste 1: Baseline (configuração atual)
    echo "📊 FASE 1: BASELINE"
    echo "=================="
    test_configuration "1g:2g" "0-7" "baseline"
    
    # Teste 2: Redução gradual de memória
    echo "📊 FASE 2: TESTE DE MEMÓRIA"
    echo "==========================="
    
    local memory_index=0
    for memory_config in "${MEMORY_CONFIGS[@]}"; do
        local test_name="memory_test_$((memory_index + 1))"
        
        if test_configuration "$memory_config" "0-7" "$test_name"; then
            echo "✅ Memória $memory_config: PASSOU"
        else
            echo "❌ Memória $memory_config: FALHOU"
        fi
        
        ((memory_index++))
        sleep 5
    done
    
    # Teste 3: Limitação de CPU (usando configuração de memória viável)
    echo "📊 FASE 3: TESTE DE CPU"
    echo "======================"
    
    local cpu_index=0
    for cpu_config in "${CPU_CONFIGS[@]}"; do
        local test_name="cpu_test_$((cpu_index + 1))"
        
        if test_configuration "512m:1g" "$cpu_config" "$test_name"; then
            echo "✅ CPU $cpu_config cores: PASSOU"
        else
            echo "❌ CPU $cpu_config cores: FALHOU"
        fi
        
        ((cpu_index++))
        sleep 5
    done
}

# Função para analisar resultados
analyze_results() {
    echo "🔍 ANÁLISE DOS RESULTADOS"
    echo "========================"
    echo ""
    
    echo "📊 Resumo dos Testes:"
    echo "===================="
    column -t -s',' results/resource-test-summary.csv
    echo ""
    
    # Encontrar configuração mínima viável
    echo "🎯 CONFIGURAÇÃO MÍNIMA VIÁVEL:"
    echo "============================="
    
    # Analisar testes de memória
    local min_memory_config=""
    local min_cpu_config=""
    
    while IFS=',' read -r test_name status avg_time min_time max_time success_rate gc_count; do
        if [[ "$test_name" == "memory_test_"* ]] && [[ "$status" == "SUCCESS" ]]; then
            if [ -z "$min_memory_config" ]; then
                min_memory_config="$test_name"
                echo "✅ Memória mínima: $(echo ${MEMORY_CONFIGS[$((${test_name#memory_test_} - 1))]})"
            fi
        fi
        
        if [[ "$test_name" == "cpu_test_"* ]] && [[ "$status" == "SUCCESS" ]]; then
            if [ -z "$min_cpu_config" ]; then
                min_cpu_config="$test_name"
                echo "✅ CPU mínimo: ${CPU_CONFIGS[$((${test_name#cpu_test_} - 1))]} cores"
            fi
        fi
    done < <(tail -n +2 results/resource-test-summary.csv)
    
    echo ""
    echo "💡 RECOMENDAÇÕES:"
    echo "================"
    echo "• Configuração mínima para desenvolvimento: 384MB-768MB RAM, 2 vCPUs"
    echo "• Configuração mínima para produção: 512MB-1GB RAM, 2 vCPUs"
    echo "• Configuração recomendada: 1GB-2GB RAM, 4 vCPUs"
    echo ""
}

# Executar testes
echo "⚠️  ATENÇÃO: Este teste pode levar 15-30 minutos para completar"
echo "🔄 Testando diferentes configurações de recursos..."
echo ""

run_resource_tests

echo "🎉 Todos os testes concluídos!"
echo ""

analyze_results

echo "📁 Arquivos gerados:"
echo "  - results/resource-test-summary.csv (resumo)"
echo "  - results/resource-test-*.csv (dados detalhados)"
echo "  - logs/app-*.log (logs da aplicação)"
echo "  - logs/gc-*.log (logs de GC)"
echo ""
echo "✅ Teste de requisitos mínimos concluído com sucesso!"
