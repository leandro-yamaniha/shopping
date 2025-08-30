# Requirements - Shopping App Backend

Este diretório contém todos os arquivos relacionados aos requisitos e análises de recursos do sistema.

## 📁 Estrutura do Diretório

```
requirements/
├── README.md                           # Este arquivo
│
├── MINIMUM_RESOURCE_REQUIREMENTS_REPORT.md  # Análise de recursos mínimos
├── JAVA21_PERFORMANCE_REPORT.md        # Relatório de performance Java 21
├── SPRING_BOOT_3.5.5_MIGRATION_REPORT.md   # Relatório de migração
├── COMPREHENSIVE_STRESS_TEST_REPORT.md # Relatório de stress test
├── BENCHMARK_REPORT_G1GC_vs_ZGC.md    # Comparação de GCs
│
├── resource-requirements-test.sh       # Teste de requisitos mínimos
├── simple-stress-test.sh              # Stress test simples
├── advanced-stress-test.sh            # Stress test avançado
├── benchmark-gc.sh                    # Benchmark de GCs
│
└── .jvmopts-*                         # Configurações JVM para testes
    ├── .jvmopts                       # Configuração padrão
    ├── .jvmopts-g1gc                  # G1GC otimizado
    ├── .jvmopts-zgc                   # ZGC otimizado
    ├── .jvmopts-java21                # Java 21 otimizado
    └── .jvmopts-test-*               # Configurações de teste
```

## 📊 Relatórios Disponíveis

### **Requisitos de Sistema**
- **MINIMUM_RESOURCE_REQUIREMENTS_REPORT.md** - Análise detalhada de recursos mínimos necessários

### **Performance e Otimização**
- **JAVA21_PERFORMANCE_REPORT.md** - Análise de performance com Java 21
- **BENCHMARK_REPORT_G1GC_vs_ZGC.md** - Comparação entre coletores de lixo

### **Migração e Compatibilidade**
- **SPRING_BOOT_3.5.5_MIGRATION_REPORT.md** - Relatório completo da migração

### **Testes de Carga**
- **COMPREHENSIVE_STRESS_TEST_REPORT.md** - Resultados de stress tests

## 🚀 Scripts de Teste

### **Testes de Requisitos**
```bash
cd requirements

# Teste de requisitos mínimos
./resource-requirements-test.sh

# Stress test simples
./simple-stress-test.sh

# Stress test avançado
./advanced-stress-test.sh

# Benchmark de GCs
./benchmark-gc.sh
```

### **Configurações JVM**
```bash
# Usar configuração específica
java @.jvmopts-zgc -jar ../target/shopping-backend-1.0.0.jar

# Teste com recursos limitados
java @.jvmopts-test-very-low -jar ../target/shopping-backend-1.0.0.jar
```

## 🎯 Como Usar

### **Para Planejamento de Infraestrutura**
Consulte os relatórios de requisitos mínimos e performance para dimensionar adequadamente os recursos.

### **Para Otimização**
Use os relatórios de benchmark para escolher as melhores configurações de JVM e GC.

### **Para Migração**
Siga as diretrizes do relatório de migração para atualizações futuras.

## 📈 Métricas Principais

### **Recursos Mínimos Recomendados**
- **CPU**: 2+ cores
- **RAM**: 1GB+ heap, 2GB+ total
- **JVM**: Java 21+
- **GC**: G1GC (recomendado)

### **Performance Observada**
- **Startup**: 1.4s (padrão), 0.024s (com CDS)
- **Throughput**: Alta performance com G1GC
- **Latência**: Baixa com configurações otimizadas
