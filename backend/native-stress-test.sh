#!/bin/bash

# =====================================================
# STRESS TEST: JVM vs GraalVM Native Image
# Shopping App Backend Performance Comparison
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
WARMUP_REQUESTS=100
TEST_DURATION=300  # 5 minutes
RESULTS_DIR="results/native-stress-test"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create results directory
mkdir -p "$RESULTS_DIR"
mkdir -p "logs"

echo -e "${CYAN}🚀 STRESS TEST: JVM vs GraalVM Native Image${NC}"
echo -e "${CYAN}================================================${NC}"
echo "Timestamp: $TIMESTAMP"
echo "Stress Requests: $STRESS_REQUESTS"
echo "Concurrent Requests: $CONCURRENT_REQUESTS"
echo "Test Duration: $TEST_DURATION seconds"
echo ""

# Function to check if GraalVM is available
check_graalvm() {
    if ! command -v native-image &> /dev/null; then
        echo -e "${RED}❌ GraalVM native-image not found!${NC}"
        echo "Please install GraalVM and add native-image to PATH"
        echo "Installation: https://www.graalvm.org/downloads/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ GraalVM native-image found${NC}"
    native-image --version
    echo ""
}

# Function to build native image
build_native_image() {
    echo -e "${YELLOW}🔨 Building Native Image...${NC}"
    echo "This may take 5-10 minutes..."
    
    start_time=$(date +%s)
    
    # Clean and compile
    mvn clean package -DskipTests -Pnative > logs/native-build.log 2>&1
    
    build_time=$(($(date +%s) - start_time))
    
    if [ -f "target/shopping-backend-native" ]; then
        echo -e "${GREEN}✅ Native image built successfully in ${build_time}s${NC}"
        
        # Get native image size
        native_size=$(du -h target/shopping-backend-native | cut -f1)
        echo "Native image size: $native_size"
        
        # Save build metrics
        echo "native_build_time_seconds,$build_time" > "$RESULTS_DIR/build-metrics-$TIMESTAMP.csv"
        echo "native_image_size,$native_size" >> "$RESULTS_DIR/build-metrics-$TIMESTAMP.csv"
    else
        echo -e "${RED}❌ Native image build failed!${NC}"
        echo "Check logs/native-build.log for details"
        exit 1
    fi
    echo ""
}

# Function to measure startup time and memory
measure_startup() {
    local mode=$1
    local command=$2
    local log_file=$3
    
    echo -e "${BLUE}📊 Measuring startup time for $mode...${NC}"
    
    # Start application and measure startup
    start_time=$(date +%s.%N)
    
    if [ "$mode" = "JVM" ]; then
        timeout 60 $command > "$log_file" 2>&1 &
    else
        timeout 60 $command > "$log_file" 2>&1 &
    fi
    
    app_pid=$!
    
    # Wait for application to be ready
    for i in {1..60}; do
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            startup_time=$(echo "$(date +%s.%N) - $start_time" | bc -l)
            echo -e "${GREEN}✅ $mode started in ${startup_time}s${NC}"
            
            # Measure initial memory usage (RSS)
            if [ "$mode" = "Native" ]; then
                # For native image, get memory from ps
                memory_kb=$(ps -o rss= -p $app_pid 2>/dev/null || echo "0")
                memory_mb=$(echo "scale=2; $memory_kb / 1024" | bc -l)
            else
                # For JVM, try to get heap usage from actuator
                sleep 2  # Give JVM time to initialize
                heap_used=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
                memory_mb=$(echo "scale=2; $heap_used / 1048576" | bc -l)
                
                # Also get RSS for comparison
                rss_kb=$(ps -o rss= -p $app_pid 2>/dev/null || echo "0")
                rss_mb=$(echo "scale=2; $rss_kb / 1024" | bc -l)
                echo "  JVM Heap: ${memory_mb}MB, RSS: ${rss_mb}MB"
            fi
            
            echo "  Memory usage: ${memory_mb}MB"
            
            # Save startup metrics
            echo "$mode,startup_time_seconds,$startup_time" >> "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv"
            echo "$mode,memory_usage_mb,$memory_mb" >> "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv"
            
            return 0
        fi
        
        # Check if process is still running
        if ! kill -0 $app_pid 2>/dev/null; then
            echo -e "${RED}❌ $mode failed to start${NC}"
            return 1
        fi
        
        sleep 1
    done
    
    echo -e "${RED}❌ $mode startup timeout${NC}"
    kill $app_pid 2>/dev/null || true
    return 1
}

# Function to run stress test
run_stress_test() {
    local mode=$1
    local app_pid=$2
    
    echo -e "${PURPLE}🔥 Running stress test for $mode...${NC}"
    
    # Warmup
    echo "  Warming up with $WARMUP_REQUESTS requests..."
    for i in $(seq 1 $WARMUP_REQUESTS); do
        curl -s http://localhost:8080/actuator/health > /dev/null 2>&1 || true
    done
    
    # Collect initial metrics
    if [ "$mode" = "JVM" ]; then
        initial_heap=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
        initial_gc_count=$(curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause 2>/dev/null | jq -r '.measurements[] | select(.statistic=="COUNT") | .value' 2>/dev/null || echo "0")
    fi
    
    # Start CPU monitoring
    iostat -c 1 > "$RESULTS_DIR/cpu-$mode-$TIMESTAMP.log" &
    iostat_pid=$!
    
    # Start memory monitoring
    while kill -0 $app_pid 2>/dev/null; do
        memory_kb=$(ps -o rss= -p $app_pid 2>/dev/null || echo "0")
        memory_mb=$(echo "scale=2; $memory_kb / 1024" | bc -l)
        cpu_percent=$(ps -o %cpu= -p $app_pid 2>/dev/null || echo "0")
        echo "$(date +%s),$memory_mb,$cpu_percent" >> "$RESULTS_DIR/runtime-metrics-$mode-$TIMESTAMP.csv"
        sleep 1
    done &
    monitor_pid=$!
    
    # Run concurrent stress test
    echo "  Running $STRESS_REQUESTS requests with $CONCURRENT_REQUESTS concurrent..."
    
    stress_start=$(date +%s.%N)
    
    # Use Apache Bench for precise load testing
    if command -v ab &> /dev/null; then
        ab -n $STRESS_REQUESTS -c $CONCURRENT_REQUESTS -g "$RESULTS_DIR/ab-$mode-$TIMESTAMP.tsv" \
           http://localhost:8080/actuator/health > "$RESULTS_DIR/ab-$mode-$TIMESTAMP.txt" 2>&1
    else
        # Fallback to curl-based testing
        echo "  Apache Bench not found, using curl-based testing..."
        
        total_time=0
        successful_requests=0
        failed_requests=0
        min_time=999
        max_time=0
        
        for i in $(seq 1 $STRESS_REQUESTS); do
            req_start=$(date +%s.%N)
            
            if curl -s -w "%{http_code}" http://localhost:8080/actuator/health | grep -q "200"; then
                req_end=$(date +%s.%N)
                response_time=$(echo "$req_end - $req_start" | bc -l)
                total_time=$(echo "$total_time + $response_time" | bc -l)
                ((successful_requests++))
                
                # Update min/max
                if (( $(echo "$response_time < $min_time" | bc -l) )); then
                    min_time=$response_time
                fi
                if (( $(echo "$response_time > $max_time" | bc -l) )); then
                    max_time=$response_time
                fi
                
                # Log individual request
                echo "$i,$response_time" >> "$RESULTS_DIR/requests-$mode-$TIMESTAMP.csv"
            else
                ((failed_requests++))
            fi
            
            # Progress indicator
            if [ $((i % 50)) -eq 0 ]; then
                echo "    Progress: $i/$STRESS_REQUESTS"
            fi
        done
        
        stress_end=$(date +%s.%N)
        total_test_time=$(echo "$stress_end - $stress_start" | bc -l)
        
        # Calculate metrics
        if [ $successful_requests -gt 0 ]; then
            avg_response=$(echo "scale=3; $total_time / $successful_requests" | bc -l)
            throughput=$(echo "scale=2; $successful_requests / $total_test_time" | bc -l)
        else
            avg_response="N/A"
            throughput="0"
        fi
        
        success_rate=$(echo "scale=1; ($successful_requests * 100) / $STRESS_REQUESTS" | bc -l)
        
        # Save stress test results
        echo "$mode,total_requests,$STRESS_REQUESTS" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,successful_requests,$successful_requests" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,failed_requests,$failed_requests" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,success_rate_percent,$success_rate" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,avg_response_time_seconds,$avg_response" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,min_response_time_seconds,$min_time" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,max_response_time_seconds,$max_time" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,throughput_rps,$throughput" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,total_test_time_seconds,$total_test_time" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
    fi
    
    # Collect final metrics
    if [ "$mode" = "JVM" ]; then
        final_heap=$(curl -s http://localhost:8080/actuator/metrics/jvm.memory.used 2>/dev/null | jq -r '.measurements[0].value' 2>/dev/null || echo "0")
        final_gc_count=$(curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause 2>/dev/null | jq -r '.measurements[] | select(.statistic=="COUNT") | .value' 2>/dev/null || echo "0")
        
        heap_growth=$(echo "scale=2; ($final_heap - $initial_heap) / 1048576" | bc -l)
        gc_collections=$(echo "$final_gc_count - $initial_gc_count" | bc -l)
        
        echo "$mode,heap_growth_mb,$heap_growth" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
        echo "$mode,gc_collections,$gc_collections" >> "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
    fi
    
    # Stop monitoring
    kill $iostat_pid 2>/dev/null || true
    kill $monitor_pid 2>/dev/null || true
    
    echo -e "${GREEN}✅ Stress test completed for $mode${NC}"
}

# Function to stop application
stop_application() {
    local app_pid=$1
    local mode=$2
    
    echo "🛑 Stopping $mode application..."
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
    sleep 2
}

# Function to generate comparison report
generate_report() {
    echo -e "${CYAN}📊 Generating comparison report...${NC}"
    
    cat > "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md" << 'EOF'
# 🚀 Native Image vs JVM Stress Test Report
## Shopping App Backend Performance Comparison

**Test Date:** $(date)
**Test Configuration:**
- Stress Requests: STRESS_REQUESTS_PLACEHOLDER
- Concurrent Requests: CONCURRENT_REQUESTS_PLACEHOLDER
- Test Duration: TEST_DURATION_PLACEHOLDER seconds
- GraalVM Version: $(native-image --version | head -1)

---

## 📊 Performance Comparison

### Startup Time
| Mode | Startup Time | Memory Usage |
|------|-------------|--------------|
EOF

    # Add actual results to report
    if [ -f "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv" ]; then
        while IFS=',' read -r mode metric value; do
            if [ "$metric" = "startup_time_seconds" ]; then
                echo "| $mode | ${value}s |" >> "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md"
            fi
        done < "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv"
    fi
    
    echo "" >> "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md"
    echo "### Stress Test Results" >> "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md"
    
    # Replace placeholders
    sed -i.bak "s/STRESS_REQUESTS_PLACEHOLDER/$STRESS_REQUESTS/g" "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md"
    sed -i.bak "s/CONCURRENT_REQUESTS_PLACEHOLDER/$CONCURRENT_REQUESTS/g" "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md"
    sed -i.bak "s/TEST_DURATION_PLACEHOLDER/$TEST_DURATION/g" "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md"
    rm "$RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md.bak"
    
    echo -e "${GREEN}✅ Report generated: $RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if PostgreSQL is running
    if ! curl -s http://localhost:5432 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Starting PostgreSQL container...${NC}"
        docker run -d --name postgres-shopping \
            -e POSTGRES_DB=shopping_db \
            -e POSTGRES_USER=shopping_user \
            -e POSTGRES_PASSWORD=shopping_pass \
            -p 5432:5432 \
            postgres:15.4 > /dev/null 2>&1 || true
        sleep 5
    fi
    
    check_graalvm
    
    # Initialize CSV headers
    echo "mode,metric,value" > "$RESULTS_DIR/startup-metrics-$TIMESTAMP.csv"
    echo "mode,metric,value" > "$RESULTS_DIR/stress-results-$TIMESTAMP.csv"
    echo "timestamp,memory_mb,cpu_percent" > "$RESULTS_DIR/runtime-metrics-JVM-$TIMESTAMP.csv"
    echo "timestamp,memory_mb,cpu_percent" > "$RESULTS_DIR/runtime-metrics-Native-$TIMESTAMP.csv"
    echo "request_number,response_time_seconds" > "$RESULTS_DIR/requests-JVM-$TIMESTAMP.csv"
    echo "request_number,response_time_seconds" > "$RESULTS_DIR/requests-Native-$TIMESTAMP.csv"
    
    # Build native image
    build_native_image
    
    # Test JVM version
    echo -e "${BLUE}🔥 Testing JVM Version${NC}"
    echo "================================"
    
    # Configure for Java 21
    export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
    export PATH="$JAVA_HOME/bin:$PATH"
    cp .jvmopts-java21 .jvmopts
    
    if measure_startup "JVM" "mvn spring-boot:run" "logs/jvm-stress-test.log"; then
        jvm_pid=$(pgrep -f "com.shopping.ShoppingApplication" | head -1)
        run_stress_test "JVM" $jvm_pid
        stop_application $jvm_pid "JVM"
    else
        echo -e "${RED}❌ JVM test failed${NC}"
    fi
    
    echo ""
    
    # Test Native version
    echo -e "${BLUE}🔥 Testing Native Image${NC}"
    echo "================================="
    
    if measure_startup "Native" "./target/shopping-backend-native" "logs/native-stress-test.log"; then
        native_pid=$(pgrep -f "shopping-backend-native" | head -1)
        run_stress_test "Native" $native_pid
        stop_application $native_pid "Native"
    else
        echo -e "${RED}❌ Native test failed${NC}"
    fi
    
    # Generate report
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 Stress test completed successfully!${NC}"
    echo -e "${CYAN}📁 Results saved in: $RESULTS_DIR/${NC}"
    echo -e "${CYAN}📊 Report: $RESULTS_DIR/NATIVE_STRESS_TEST_REPORT-$TIMESTAMP.md${NC}"
}

# Run main function
main "$@"
