#!/bin/bash

# =====================================================
# ADVANCED STRESS TEST: JVM Configurations Comparison
# Shopping App Backend - Comprehensive Performance Analysis
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
STRESS_REQUESTS=1000
CONCURRENT_REQUESTS=100
WARMUP_REQUESTS=50
TEST_DURATION=600  # 10 minutes
RESULTS_DIR="results/advanced-stress-test"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Test configurations (compatible with macOS bash)
CONFIGS=(
    "Java17_G1GC:17:.jvmopts-g1gc"
    "Java17_ZGC:17:.jvmopts-zgc"
    "Java21_G1GC:21:.jvmopts-g1gc"
    "Java21_ZGC:21:.jvmopts-zgc"
    "Java21_UltraLow:21:.jvmopts-java21-ultra-low"
)

# Create results directory
mkdir -p "$RESULTS_DIR"
mkdir -p "logs/stress"

echo -e "${CYAN}🚀 ADVANCED STRESS TEST: JVM Configurations${NC}"
echo -e "${CYAN}==============================================${NC}"
echo "Timestamp: $TIMESTAMP"
echo "Stress Requests: $STRESS_REQUESTS per configuration"
echo "Concurrent Requests: $CONCURRENT_REQUESTS"
echo "Test Duration: $TEST_DURATION seconds"
echo "Configurations to test: ${#CONFIGS[@]}"
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

# Function to measure comprehensive metrics
measure_comprehensive_metrics() {
    local config_name=$1
    local app_pid=$2
    local test_duration=$3
    
    echo -e "${BLUE}📊 Collecting comprehensive metrics for $config_name...${NC}"
    
    # Initialize metric files
    echo "timestamp,memory_mb,cpu_percent,heap_used_mb,heap_committed_mb,gc_count" > "$RESULTS_DIR/runtime-$config_name-$TIMESTAMP.csv"
    echo "timestamp,response_time_ms,status_code" > "$RESULTS_DIR/requests-$config_name-$TIMESTAMP.csv"
    
    # Start continuous monitoring
    local monitor_start=$(date +%s)
    local request_count=0
    
    while [ $(($(date +%s) - monitor_start)) -lt $test_duration ]; do
        # Memory metrics
        local memory_kb=$(ps -o rss= -p $app_pid 2>/dev/null || echo "0")
        local memory_mb=$(echo "scale=2; $memory_kb / 1024" | bc -l)
        local cpu_percent=$(ps -o %cpu= -p $app_pid 2>/dev/null || echo "0")
        
        # JVM specific metrics (if available)
        local heap_used="0"
        local heap_committed="0"
        local gc_count="0"
        
        if curl -s http://localhost:8080/actuator/metrics/jvm.memory.used > /dev/null 2>&1; then
            heap_used=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
            heap_committed=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.committed 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
            gc_count=$(curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause 2>/dev/null | jq -r '.measurements[] | select(.statistic=="COUNT") | .value' 2>/dev/null || echo "0")
        fi
        
        local heap_used_mb=$(echo "scale=2; $heap_used / 1048576" | bc -l)
        local heap_committed_mb=$(echo "scale=2; $heap_committed / 1048576" | bc -l)
        
        # Log runtime metrics
        echo "$(date +%s),$memory_mb,$cpu_percent,$heap_used_mb,$heap_committed_mb,$gc_count" >> "$RESULTS_DIR/runtime-$config_name-$TIMESTAMP.csv"
        
        # Performance test request
        local req_start=$(date +%s.%N)
        local status_code=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/actuator/health 2>/dev/null || echo "000")
        local req_end=$(date +%s.%N)
        local response_time=$(echo "($req_end - $req_start) * 1000" | bc -l)
        
        # Log request metrics
        echo "$(date +%s),$response_time,$status_code" >> "$RESULTS_DIR/requests-$config_name-$TIMESTAMP.csv"
        
        ((request_count++))
        
        # Progress indicator
        if [ $((request_count % 60)) -eq 0 ]; then
            local elapsed=$(($(date +%s) - monitor_start))
            echo "  Monitoring: ${elapsed}s elapsed, ${request_count} requests tested"
        fi
        
        sleep 1
    done
    
    echo -e "${GREEN}✅ Comprehensive monitoring completed for $config_name${NC}"
    echo "  Total requests monitored: $request_count"
}

# Function to run stress test with Apache Bench
run_apache_bench_test() {
    local config_name=$1
    
    echo -e "${PURPLE}🔥 Running Apache Bench stress test for $config_name...${NC}"
    
    # Warmup
    echo "  Warming up with $WARMUP_REQUESTS requests..."
    ab -n $WARMUP_REQUESTS -c 10 http://localhost:8080/actuator/health > /dev/null 2>&1 || true
    
    # Main stress test
    echo "  Running main stress test: $STRESS_REQUESTS requests, $CONCURRENT_REQUESTS concurrent"
    
    ab -n $STRESS_REQUESTS -c $CONCURRENT_REQUESTS \
       -g "$RESULTS_DIR/ab-plot-$config_name-$TIMESTAMP.tsv" \
       -e "$RESULTS_DIR/ab-percentiles-$config_name-$TIMESTAMP.csv" \
       http://localhost:8080/actuator/health > "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Apache Bench test completed for $config_name${NC}"
        
        # Extract key metrics
        local rps=$(grep "Requests per second" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $4}')
        local mean_time=$(grep "Time per request.*mean" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | head -1 | awk '{print $4}')
        local p50=$(grep "50%" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $2}')
        local p95=$(grep "95%" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $2}')
        local p99=$(grep "99%" "$RESULTS_DIR/ab-summary-$config_name-$TIMESTAMP.txt" | awk '{print $2}')
        
        echo "  Requests/sec: $rps"
        echo "  Mean time: ${mean_time}ms"
        echo "  P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms"
        
        # Save summary metrics
        echo "$config_name,requests_per_second,$rps" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
        echo "$config_name,mean_response_time_ms,$mean_time" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
        echo "$config_name,p50_ms,$p50" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
        echo "$config_name,p95_ms,$p95" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
        echo "$config_name,p99_ms,$p99" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
    else
        echo -e "${RED}❌ Apache Bench test failed for $config_name${NC}"
    fi
}

# Function to test configuration
test_configuration() {
    local config_name=$1
    local java_version=$2
    local jvm_opts_file=$3
    
    echo -e "${YELLOW}🧪 Testing Configuration: $config_name${NC}"
    echo "=================================="
    echo "Java Version: $java_version"
    echo "JVM Options: $jvm_opts_file"
    echo ""
    
    # Setup Java version
    setup_java $java_version
    
    # Copy JVM options
    cp "$jvm_opts_file" .jvmopts
    
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
            
            # Save startup metrics
            echo "$config_name,startup_time_seconds,$startup_time" >> "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv"
            
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
    
    # Start comprehensive monitoring in background
    measure_comprehensive_metrics "$config_name" $app_pid $TEST_DURATION &
    local monitor_pid=$!
    
    # Wait a bit for monitoring to start
    sleep 5
    
    # Run Apache Bench stress test
    run_apache_bench_test "$config_name"
    
    # Wait for monitoring to complete
    wait $monitor_pid
    
    # Collect final metrics
    echo "📊 Collecting final metrics..."
    
    local final_memory_kb=$(ps -o rss= -p $app_pid 2>/dev/null || echo "0")
    local final_memory_mb=$(echo "scale=2; $final_memory_kb / 1024" | bc -l)
    local final_cpu=$(ps -o %cpu= -p $app_pid 2>/dev/null || echo "0")
    
    if curl -s http://localhost:8080/actuator/metrics/jvm.memory.used > /dev/null 2>&1; then
        local final_heap=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
        local final_heap_mb=$(echo "scale=2; $final_heap / 1048576" | bc -l)
        local final_gc=$(curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause 2>/dev/null | jq -r '.measurements[] | select(.statistic=="COUNT") | .value' 2>/dev/null || echo "0")
        
        echo "$config_name,final_heap_mb,$final_heap_mb" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
        echo "$config_name,final_gc_count,$final_gc" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
    fi
    
    echo "$config_name,final_memory_mb,$final_memory_mb" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
    echo "$config_name,final_cpu_percent,$final_cpu" >> "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
    
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
    
    echo -e "${GREEN}✅ Configuration $config_name test completed${NC}"
    echo ""
}

# Function to generate comprehensive report
generate_comprehensive_report() {
    echo -e "${CYAN}📊 Generating comprehensive stress test report...${NC}"
    
    local report_file="$RESULTS_DIR/ADVANCED_STRESS_TEST_REPORT-$TIMESTAMP.md"
    
    cat > "$report_file" << EOF
# 🚀 Advanced Stress Test Report
## Shopping App Backend - JVM Configuration Comparison

**Test Date:** $(date)
**Test Duration:** $TEST_DURATION seconds per configuration
**Stress Load:** $STRESS_REQUESTS requests with $CONCURRENT_REQUESTS concurrent
**Configurations Tested:** ${#CONFIGS[@]}

---

## 📊 Test Summary

### Configurations Tested:
EOF

    for config in "${!CONFIGS[@]}"; do
        IFS=' ' read -r java_version jvm_opts <<< "${CONFIGS[$config]}"
        echo "- **$config**: Java $java_version with $jvm_opts" >> "$report_file"
    done

    cat >> "$report_file" << EOF

---

## 📈 Performance Metrics

### Startup Time Comparison
| Configuration | Startup Time (s) |
|---------------|------------------|
EOF

    if [ -f "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv" ]; then
        while IFS=',' read -r config metric value; do
            if [ "$metric" = "startup_time_seconds" ]; then
                echo "| $config | $value |" >> "$report_file"
            fi
        done < "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv"
    fi

    cat >> "$report_file" << EOF

### Throughput and Latency
| Configuration | RPS | Mean (ms) | P95 (ms) | P99 (ms) |
|---------------|-----|-----------|----------|----------|
EOF

    if [ -f "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv" ]; then
        # Create temporary associative array for metrics
        declare -A metrics
        while IFS=',' read -r config metric value; do
            metrics["$config,$metric"]="$value"
        done < "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
        
        for config in "${!CONFIGS[@]}"; do
            local rps="${metrics["$config,requests_per_second"]:-N/A}"
            local mean="${metrics["$config,mean_response_time_ms"]:-N/A}"
            local p95="${metrics["$config,p95_ms"]:-N/A}"
            local p99="${metrics["$config,p99_ms"]:-N/A}"
            echo "| $config | $rps | $mean | $p95 | $p99 |" >> "$report_file"
        done
    fi

    cat >> "$report_file" << EOF

---

## 🎯 Key Findings

### Best Performing Configuration:
- **Startup Time**: [To be analyzed from data]
- **Throughput**: [To be analyzed from data]
- **Latency**: [To be analyzed from data]

### Memory Efficiency:
- **Lowest Memory Usage**: [To be analyzed from data]
- **Most Stable**: [To be analyzed from data]

### Recommendations:
1. **Production**: [Based on analysis]
2. **Development**: [Based on analysis]
3. **Testing**: [Based on analysis]

---

## 📁 Generated Files

- Runtime metrics: \`runtime-*-$TIMESTAMP.csv\`
- Request logs: \`requests-*-$TIMESTAMP.csv\`
- Apache Bench results: \`ab-*-$TIMESTAMP.*\`
- Application logs: \`logs/stress/app-*-$TIMESTAMP.log\`

---

**✅ Advanced Stress Test Completed Successfully!**

*This comprehensive test provides detailed insights into JVM configuration performance under stress conditions.*
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
    
    # Initialize CSV files
    echo "configuration,metric,value" > "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv"
    echo "configuration,metric,value" > "$RESULTS_DIR/summary-metrics-$TIMESTAMP.csv"
    
    # Test each configuration
    for config in "${!CONFIGS[@]}"; do
        IFS=' ' read -r java_version jvm_opts_file <<< "${CONFIGS[$config]}"
        
        if [ -f "$jvm_opts_file" ]; then
            test_configuration "$config" "$java_version" "$jvm_opts_file"
        else
            echo -e "${RED}❌ JVM options file not found: $jvm_opts_file${NC}"
        fi
        
        # Wait between tests
        sleep 5
    done
    
    # Generate comprehensive report
    generate_comprehensive_report
    
    echo ""
    echo -e "${GREEN}🎉 Advanced stress test completed successfully!${NC}"
    echo -e "${CYAN}📁 Results saved in: $RESULTS_DIR/${NC}"
    echo -e "${CYAN}📊 Report: $RESULTS_DIR/ADVANCED_STRESS_TEST_REPORT-$TIMESTAMP.md${NC}"
}

# Run main function
main "$@"
