#!/bin/bash

# =====================================================
# SIMPLE STRESS TEST: JVM Performance Comparison
# Shopping App Backend - Startup, Memory, CPU, Latency, Throughput
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
STRESS_REQUESTS=500
CONCURRENT_REQUESTS=50
WARMUP_REQUESTS=25
RESULTS_DIR="results/simple-stress-test"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create results directory
mkdir -p "$RESULTS_DIR"
mkdir -p "logs/stress"

echo -e "${CYAN}🚀 SIMPLE STRESS TEST: JVM Performance Analysis${NC}"
echo -e "${CYAN}===============================================${NC}"
echo "Timestamp: $TIMESTAMP"
echo "Stress Requests: $STRESS_REQUESTS per configuration"
echo "Concurrent Requests: $CONCURRENT_REQUESTS"
echo ""

# Function to setup Java version
setup_java() {
    local java_version=$1
    
    if [ "$java_version" = "17" ]; then
        export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
    else
        export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
    fi
    
    export PATH="$JAVA_HOME/bin:$PATH"
    
    echo "Java version configured:"
    java -version 2>&1 | head -1
}

# Function to run performance test
run_performance_test() {
    local config_name=$1
    local java_version=$2
    local jvm_opts_file=$3
    
    echo -e "${YELLOW}🧪 Testing: $config_name${NC}"
    echo "=================================="
    echo "Java Version: $java_version"
    echo "JVM Options: $jvm_opts_file"
    echo ""
    
    # Setup Java version
    setup_java $java_version
    
    # Copy JVM options
    if [ -f "$jvm_opts_file" ]; then
        cp "$jvm_opts_file" .jvmopts
    else
        echo -e "${RED}❌ JVM options file not found: $jvm_opts_file${NC}"
        return 1
    fi
    
    # Measure startup time
    echo "📊 Measuring startup time..."
    local startup_start=$(date +%s.%N)
    
    mvn spring-boot:run > "logs/stress/app-$config_name-$TIMESTAMP.log" 2>&1 &
    local app_pid=$!
    
    # Wait for application to start
    local startup_success=false
    for i in {1..60}; do
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            local startup_end=$(date +%s.%N)
            local startup_time=$(echo "$startup_end - $startup_start" | bc -l)
            echo -e "${GREEN}✅ Application started in ${startup_time}s${NC}"
            
            startup_success=true
            break
        fi
        
        if ! kill -0 $app_pid 2>/dev/null; then
            echo -e "${RED}❌ Application failed to start${NC}"
            return 1
        fi
        
        sleep 1
    done
    
    if [ "$startup_success" = false ]; then
        echo -e "${RED}❌ Startup timeout for $config_name${NC}"
        kill $app_pid 2>/dev/null || true
        return 1
    fi
    
    # Wait for JVM to stabilize
    sleep 10
    
    # Collect initial metrics
    echo "📊 Collecting initial metrics..."
    local initial_memory_kb=$(ps -o rss= -p $app_pid 2>/dev/null || echo "0")
    local initial_memory_mb=$(echo "scale=2; $initial_memory_kb / 1024" | bc -l)
    
    local initial_heap="0"
    local initial_gc="0"
    if curl -s http://localhost:8080/actuator/metrics/jvm.memory.used > /dev/null 2>&1; then
        initial_heap=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
        initial_gc=$(curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause 2>/dev/null | jq -r '.measurements[] | select(.statistic=="COUNT") | .value' 2>/dev/null || echo "0")
    fi
    local initial_heap_mb=$(echo "scale=2; $initial_heap / 1048576" | bc -l)
    
    echo "  Initial Memory: ${initial_memory_mb}MB"
    echo "  Initial Heap: ${initial_heap_mb}MB"
    
    # Warmup
    echo "🔥 Warming up with $WARMUP_REQUESTS requests..."
    for i in $(seq 1 $WARMUP_REQUESTS); do
        curl -s http://localhost:8080/actuator/health > /dev/null 2>&1 || true
    done
    
    # Run stress test with Apache Bench
    echo "🔥 Running stress test: $STRESS_REQUESTS requests, $CONCURRENT_REQUESTS concurrent..."
    
    ab -n $STRESS_REQUESTS -c $CONCURRENT_REQUESTS \
       -g "$RESULTS_DIR/ab-plot-$config_name-$TIMESTAMP.tsv" \
       -e "$RESULTS_DIR/ab-percentiles-$config_name-$TIMESTAMP.csv" \
       http://localhost:8080/actuator/health > "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Stress test completed${NC}"
        
        # Extract key metrics from Apache Bench
        local rps=$(grep "Requests per second" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $4}' | head -1)
        local mean_time=$(grep "Time per request.*mean" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | head -1 | awk '{print $4}')
        local p50=$(grep "50%" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $2}' | head -1)
        local p95=$(grep "95%" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $2}' | head -1)
        local p99=$(grep "99%" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $2}' | head -1)
        
        echo "  Throughput: $rps req/s"
        echo "  Mean latency: ${mean_time}ms"
        echo "  P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms"
    else
        echo -e "${RED}❌ Stress test failed${NC}"
        rps="0"
        mean_time="N/A"
        p50="N/A"
        p95="N/A"
        p99="N/A"
    fi
    
    # Collect final metrics
    echo "📊 Collecting final metrics..."
    local final_memory_kb=$(ps -o rss= -p $app_pid 2>/dev/null || echo "0")
    local final_memory_mb=$(echo "scale=2; $final_memory_kb / 1024" | bc -l)
    local final_cpu=$(ps -o %cpu= -p $app_pid 2>/dev/null || echo "0")
    
    local final_heap="0"
    local final_gc="0"
    if curl -s http://localhost:8080/actuator/metrics/jvm.memory.used > /dev/null 2>&1; then
        final_heap=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
        final_gc=$(curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause 2>/dev/null | jq -r '.measurements[] | select(.statistic=="COUNT") | .value' 2>/dev/null || echo "0")
    fi
    local final_heap_mb=$(echo "scale=2; $final_heap / 1048576" | bc -l)
    local gc_collections=$(echo "$final_gc - $initial_gc" | bc -l)
    local memory_growth=$(echo "$final_memory_mb - $initial_memory_mb" | bc -l)
    
    echo "  Final Memory: ${final_memory_mb}MB (growth: ${memory_growth}MB)"
    echo "  Final Heap: ${final_heap_mb}MB"
    echo "  GC Collections: $gc_collections"
    echo "  CPU Usage: ${final_cpu}%"
    
    # Save all metrics to CSV
    echo "$config_name,$startup_time,$initial_memory_mb,$final_memory_mb,$memory_growth,$initial_heap_mb,$final_heap_mb,$gc_collections,$final_cpu,$rps,$mean_time,$p50,$p95,$p99" >> "$RESULTS_DIR/stress-test-results-$TIMESTAMP.csv"
    
    # Stop application
    echo "🛑 Stopping application..."
    kill $app_pid 2>/dev/null || true
    
    # Wait for graceful shutdown
    for i in {1..10}; do
        if ! kill -0 $app_pid 2>/dev/null; then
            break
        fi
        sleep 1
    done
    
    # Force kill if still running
    kill -9 $app_pid 2>/dev/null || true
    sleep 3
    
    echo -e "${GREEN}✅ Test completed for $config_name${NC}"
    echo ""
}

# Function to generate report
generate_report() {
    echo -e "${CYAN}📊 Generating stress test report...${NC}"
    
    local report_file="$RESULTS_DIR/STRESS_TEST_REPORT-$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# 🚀 Stress Test Report
## Shopping App Backend - JVM Performance Analysis

**Test Date:** $(date)
**Test Configuration:**
- Stress Requests: $STRESS_REQUESTS per configuration
- Concurrent Requests: $CONCURRENT_REQUESTS
- Warmup Requests: $WARMUP_REQUESTS

---

## 📊 Performance Results

### Summary Table
| Configuration | Startup (s) | Memory (MB) | Growth (MB) | Heap (MB) | GC Count | CPU (%) | RPS | Mean (ms) | P95 (ms) | P99 (ms) |
|---------------|-------------|-------------|-------------|-----------|----------|---------|-----|-----------|----------|----------|
EOF

    if [ -f "$RESULTS_DIR/stress-test-results-$TIMESTAMP.csv" ]; then
        while IFS=',' read -r config startup initial_mem final_mem growth initial_heap final_heap gc cpu rps mean p95 p99; do
            echo "| $config | $startup | $final_mem | $growth | $final_heap | $gc | $cpu | $rps | $mean | $p95 | $p99 |" >> "$report_file"
        done < "$RESULTS_DIR/stress-test-results-$TIMESTAMP.csv"
    fi

    cat >> "$report_file" << EOF

---

## 🎯 Analysis

### Startup Performance:
- **Fastest Startup**: [To be analyzed from data]
- **Slowest Startup**: [To be analyzed from data]

### Memory Efficiency:
- **Lowest Memory Usage**: [To be analyzed from data]
- **Highest Memory Growth**: [To be analyzed from data]

### Throughput Performance:
- **Highest RPS**: [To be analyzed from data]
- **Best Latency (P99)**: [To be analyzed from data]

### GC Performance:
- **Fewest GC Collections**: [To be analyzed from data]
- **Most Stable**: [To be analyzed from data]

---

## 📁 Generated Files

- **Summary Results**: \`stress-test-results-$TIMESTAMP.csv\`
- **Apache Bench Details**: \`ab-summary-*-$TIMESTAMP.txt\`
- **Latency Plots**: \`ab-plot-*-$TIMESTAMP.tsv\`
- **Percentile Data**: \`ab-percentiles-*-$TIMESTAMP.csv\`
- **Application Logs**: \`logs/stress/app-*-$TIMESTAMP.log\`

---

**✅ Stress Test Completed Successfully!**

*This test provides comprehensive performance metrics for different JVM configurations under stress conditions.*
EOF

    echo -e "${GREEN}✅ Report generated: $report_file${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if PostgreSQL is running
    if ! docker ps | grep postgres > /dev/null; then
        echo -e "${YELLOW}⚠️  Starting PostgreSQL container...${NC}"
        docker run -d --name postgres-shopping \
            -e POSTGRES_DB=shopping_db \
            -e POSTGRES_USER=shopping_user \
            -e POSTGRES_PASSWORD=shopping_pass \
            -p 5432:5432 \
            postgres:15.4 > /dev/null 2>&1 || true
        sleep 10
    fi
    
    # Check Apache Bench
    if ! command -v ab &> /dev/null; then
        echo -e "${RED}❌ Apache Bench (ab) not found!${NC}"
        echo "Please install: brew install httpd"
        exit 1
    fi
    
    # Initialize CSV file
    echo "config,startup_time,initial_memory_mb,final_memory_mb,memory_growth_mb,initial_heap_mb,final_heap_mb,gc_collections,cpu_percent,requests_per_second,mean_latency_ms,p50_ms,p95_ms,p99_ms" > "$RESULTS_DIR/stress-test-results-$TIMESTAMP.csv"
    
    # Test configurations
    echo -e "${BLUE}🔥 Starting stress tests...${NC}"
    echo ""
    
    # Test Java 21 with ZGC (Ultra Low Latency)
    run_performance_test "Java21_ZGC" "21" ".jvmopts-zgc"
    
    # Test Java 21 with G1GC
    run_performance_test "Java21_G1GC" "21" ".jvmopts-g1gc"
    
    # Test Java 21 Ultra Low Memory
    run_performance_test "Java21_UltraLow" "21" ".jvmopts-java21-ultra-low"
    
    # Test Java 17 with ZGC (if available)
    if [ -d "/Library/Java/JavaVirtualMachines/jdk-17.jdk" ]; then
        run_performance_test "Java17_ZGC" "17" ".jvmopts-zgc"
        run_performance_test "Java17_G1GC" "17" ".jvmopts-g1gc"
    else
        echo -e "${YELLOW}⚠️  Java 17 not found, skipping Java 17 tests${NC}"
    fi
    
    # Generate comprehensive report
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 Stress test completed successfully!${NC}"
    echo -e "${CYAN}📁 Results saved in: $RESULTS_DIR/${NC}"
    echo -e "${CYAN}📊 Report: $RESULTS_DIR/STRESS_TEST_REPORT-$TIMESTAMP.md${NC}"
    
    # Show quick summary
    echo ""
    echo -e "${CYAN}📊 Quick Summary:${NC}"
    if [ -f "$RESULTS_DIR/stress-test-results-$TIMESTAMP.csv" ]; then
        echo "Configuration | Startup | Memory | RPS | P99 Latency"
        echo "-------------|---------|--------|-----|------------"
        tail -n +2 "$RESULTS_DIR/stress-test-results-$TIMESTAMP.csv" | while IFS=',' read -r config startup initial_mem final_mem growth initial_heap final_heap gc cpu rps mean p50 p95 p99; do
            printf "%-12s | %6ss | %6sMB | %4s | %8sms\n" "$config" "$startup" "$final_mem" "$rps" "$p99"
        done
    fi
}

# Run main function
main "$@"
