# Startup Optimization - Shopping App Backend

Este diretório contém todas as ferramentas e configurações para otimizar o tempo de inicialização do Shopping App Backend.

## 📁 Estrutura do Diretório

```
startup-optimize/
├── README.md                    # Este arquivo
├── CDS-README.md               # Documentação CDS completa
├── AOT-CACHE-GUIDE.md          # Documentação AOT completa
├── LAYERED-JARS-GUIDE.md       # Documentação Layered JARs
│
├── generate-cds.sh             # Gerar arquivo CDS
├── cds-startup.sh              # Inicialização com CDS
├── benchmark-cds-final.sh      # Benchmark CDS vs Standard
├── benchmark-simple.sh         # Benchmark CDS simples
├── .jvmopts-cds               # Opções JVM para CDS
│
├── generate-aot.sh             # Gerar JAR com AOT
├── aot-startup.sh              # Inicialização com AOT
├── benchmark-aot.sh            # Benchmark AOT vs Standard
└── .jvmopts-aot               # Opções JVM para AOT
```

## 🚀 Guia Rápido

### 1. CDS (Class Data Sharing) - **Recomendado**
```bash
cd startup-optimize

# Gerar CDS
./generate-cds.sh

# Executar com CDS
./cds-startup.sh

# Benchmark
./benchmark-cds-final.sh
```

**Resultado esperado**: ~98% mais rápido (2.1s → 0.024s)

### 2. AOT (Ahead-of-Time) Cache
```bash
cd startup-optimize

# Gerar AOT
./generate-aot.sh

# Executar com AOT
./aot-startup.sh

# Benchmark
./benchmark-aot.sh
```

**Resultado esperado**: ~5% mais rápido, JAR maior

### 3. Layered JARs (Docker Optimization)
```bash
# Do diretório raiz
java -Djarmode=tools -jar target/shopping-backend-1.0.0.jar list-layers
java -Djarmode=tools -jar target/shopping-backend-1.0.0.jar extract
```

## 📊 Comparação de Tecnologias

| Tecnologia | Startup Time | JAR Size | Complexidade | Recomendação |
|------------|--------------|----------|--------------|--------------|
| **Standard** | 2.1s | 27M | Baixa | Baseline |
| **CDS** | 0.024s | 27M + 23M | Baixa | ⭐ **Melhor** |
| **AOT** | 2.0s | 49M | Média | Casos específicos |
| **Layered** | 2.1s | 27M | Baixa | Docker builds |

## 🎯 Recomendações por Cenário

### **Desenvolvimento Local**
```bash
# Usar CDS para testes rápidos
cd startup-optimize && ./cds-startup.sh
```

### **Produção**
```bash
# CDS para máxima performance
cd startup-optimize && ./cds-startup.sh
```

### **Containers Docker**
```bash
# Layered JARs + CDS
java -Djarmode=tools -jar app.jar extract
# + CDS no Dockerfile
```

### **Serverless/Lambda**
```bash
# AOT + Native Image (casos extremos)
cd startup-optimize && ./generate-aot.sh
```

## 📈 Métricas Observadas

### **CDS Performance**
- **Melhoria**: 98.9% (2.108s → 0.024s)
- **Speedup**: 87.8x mais rápido
- **Overhead**: 23MB de arquivo CDS
- **Classes**: 3.029 classes pré-carregadas

### **AOT Performance**
- **Melhoria**: ~5% (2.1s → 2.0s)
- **Overhead**: +80% tamanho JAR (27M → 49M)
- **Classes geradas**: 250 classes AOT
- **Fontes geradas**: 187 arquivos Java

## 🔧 Configurações JVM

### **CDS (.jvmopts-cds)**
```bash
-Xshare:on
-XX:SharedArchiveFile=../shopping-app.jsa
-XX:+UseG1GC
-XX:+UseStringDeduplication
```

### **AOT (.jvmopts-aot)**
```bash
-Dspring.aot.enabled=true
-XX:+UseG1GC
-XX:+UseStringCache
-XX:+AggressiveOpts
```

## 🚨 Troubleshooting

### **CDS não funciona**
```bash
# Verificar Java 21
java -version

# Regenerar CDS
rm ../shopping-app.jsa ../shopping-classes.lst
./generate-cds.sh
```

### **AOT falha**
```bash
# Verificar profile AOT no pom.xml
cd .. && mvn help:active-profiles

# Limpar e recompilar
cd startup-optimize && ./generate-aot.sh
```

### **Scripts não executam**
```bash
# Dar permissão
chmod +x *.sh

# Verificar paths
ls -la ../target/shopping-backend-1.0.0.jar
```

## 📚 Documentação Completa

- **[CDS-README.md](CDS-README.md)** - Guia completo de Class Data Sharing
- **[AOT-CACHE-GUIDE.md](AOT-CACHE-GUIDE.md)** - Guia completo de AOT Cache
- **[LAYERED-JARS-GUIDE.md](LAYERED-JARS-GUIDE.md)** - Guia completo de Layered JARs

## 🎉 Conclusão

**CDS é a tecnologia vencedora** para otimização de startup do Shopping App Backend, oferecendo:

- ✅ **Melhoria dramática** (98% mais rápido)
- ✅ **Fácil implementação** (poucos comandos)
- ✅ **Baixo overhead** (23MB adicional)
- ✅ **Alta compatibilidade** (Java 21 padrão)

Para máxima otimização, use CDS em produção e combine com Layered JARs para containers Docker.
