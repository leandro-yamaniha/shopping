# 🚀 Stress Test Report
## Shopping App Backend - JVM Performance Analysis

**Test Date:** Sat Aug 30 18:42:37 -03 2025
**Test Configuration:**
- Stress Requests: 500 per configuration
- Concurrent Requests: 50
- Warmup Requests: 25

---

## 📊 Performance Results

### Summary Table
| Configuration | Startup (s) | Memory (MB) | Growth (MB) | Heap (MB) | GC Count | CPU (%) | RPS | Mean (ms) | P95 (ms) | P99 (ms) |
|---------------|-------------|-------------|-------------|-----------|----------|---------|-----|-----------|----------|----------|
| config | startup_time | final_memory_mb | memory_growth_mb | final_heap_mb | gc_collections | cpu_percent | requests_per_second | mean_latency_ms | p50_ms | p95_ms,p99_ms |
| Java21_ZGC | 3.250855000 | 345.87 | 0 | 1.78490534 | 7.0 |   0.0 | 528.05 | 94.688 | 83 | 175,295 |
| Java21_G1GC | 3.251295000 | 345.54 | 0 | 161.80 | 7.0 |   0.0 | 551.16 | 90.717 | 84 | 146,181 |
| Java21_UltraLow | 3.246622000 | 329.39 | 0 | 128.74 | 7.0 |   0.0 | 513.02 | 97.462 | 80 | 194,264 |

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

- **Summary Results**: `stress-test-results-20250830_184140.csv`
- **Apache Bench Details**: `ab-summary-*-20250830_184140.txt`
- **Latency Plots**: `ab-plot-*-20250830_184140.tsv`
- **Percentile Data**: `ab-percentiles-*-20250830_184140.csv`
- **Application Logs**: `logs/stress/app-*-20250830_184140.log`

---

**✅ Stress Test Completed Successfully!**

*This test provides comprehensive performance metrics for different JVM configurations under stress conditions.*
