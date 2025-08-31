# Class Data Sharing (CDS) - Shopping App Backend

Este documento explica como usar Class Data Sharing (CDS) para otimizar o tempo de inicialização do backend Spring Boot.

## 📋 Visão Geral

Class Data Sharing (CDS) é uma funcionalidade do Java que permite compartilhar dados de classes entre múltiplas execuções da JVM, reduzindo significativamente o tempo de inicialização e o uso de memória.

### Benefícios do CDS:
- ⚡ **Inicialização mais rápida** (20-40% de melhoria típica)
- 💾 **Menor uso de memória** (compartilhamento entre processos)
- 🚀 **Melhor performance de cold start**
- 📦 **Otimização para containers**

## 🛠️ Arquivos Criados

```
backend/
├── generate-cds.sh          # Script para gerar arquivo CDS
├── cds-startup.sh           # Script otimizado de inicialização
├── benchmark-cds.sh         # Script de benchmark
├── .jvmopts-cds            # Opções JVM otimizadas
├── docker/Dockerfile.cds   # Dockerfile com CDS
└── CDS-README.md           # Este arquivo
```

## 🚀 Como Usar

### 1. Gerar Arquivo CDS

Primeiro, compile a aplicação e gere o arquivo CDS:

```bash
# Compilar aplicação (do diretório raiz)
mvn clean package -DskipTests

# Gerar arquivo CDS (do diretório startup-optimize)
cd startup-optimize
./generate-cds.sh
```

Este script irá:
- Executar a aplicação em modo de treinamento
- Capturar lista de classes carregadas
- Criar arquivo CDS otimizado
- Executar benchmark básico

### 2. Executar com CDS

Use o script otimizado para inicialização:

```bash
# Inicialização otimizada com CDS (do diretório startup-optimize)
cd startup-optimize
./cds-startup.sh

# Ou com profile específico
SPRING_PROFILES_ACTIVE=prod ./cds-startup.sh
```

### 3. Executar Benchmark

Para medir a melhoria de performance:

```bash
# Do diretório startup-optimize
cd startup-optimize
./benchmark-cds-final.sh
```

## 📊 Opções JVM Otimizadas

O arquivo `.jvmopts-cds` contém configurações otimizadas para Java 21:

### CDS Configuration
```bash
-Xshare:on
-XX:SharedArchiveFile=shopping-app.jsa
```

### Memory Management
```bash
-Xms512m
-Xmx1g
-XX:NewRatio=2
-XX:MetaspaceSize=256m
```

### G1 Garbage Collector
```bash
-XX:+UseG1GC
-XX:+UseStringDeduplication
-XX:G1HeapRegionSize=16m
-XX:MaxGCPauseMillis=200
```

## 🐳 Docker com CDS

Use o Dockerfile otimizado:

```bash
# Build da imagem com CDS
docker build -f docker/Dockerfile.cds -t shopping-backend-cds .

# Executar container
docker run -p 8080:8080 shopping-backend-cds
```

## 📈 Resultados Esperados

### Métricas Típicas:
- **Tempo de inicialização**: 20-40% mais rápido
- **Uso de memória**: 10-20% menor
- **Cold start**: Significativamente melhorado
- **Throughput**: Ligeiramente melhor

### Exemplo de Benchmark:
```
📊 Resultados do Benchmark:
   • Tempo médio sem CDS: 8.234s
   • Tempo médio com CDS: 5.891s
   • Melhoria: 28.45%
   • Fator de aceleração: 1.40x
```

## 🔧 Configurações Avançadas

### Para Desenvolvimento
```bash
# JVM options para desenvolvimento
-XX:+UnlockDiagnosticVMOptions
-XX:+LogVMOutput
-XX:+TraceClassLoading
```

### Para Produção
```bash
# Remover logs de debug
# Usar configurações de memória específicas
# Configurar health checks apropriados
```

## 🚨 Troubleshooting

### Problema: Arquivo CDS não encontrado
```bash
# Solução: Gerar arquivo CDS
./generate-cds.sh
```

### Problema: Aplicação não inicia com CDS
```bash
# Verificar compatibilidade
java -Xshare:on -version

# Executar sem CDS temporariamente
java -jar target/shopping-backend-1.0.0.jar
```

### Problema: Performance não melhorou
```bash
# Verificar se CDS está sendo usado
java -Xshare:on -XX:+PrintSharedArchiveAndExit

# Executar benchmark completo
./benchmark-cds.sh
```

## 📝 Notas Importantes

1. **Java 21**: CDS funciona melhor com Java 21+
2. **Compatibilidade**: Arquivo CDS é específico para versão do Java
3. **Regeneração**: Regenerar CDS após mudanças significativas no código
4. **Containers**: CDS é especialmente útil em ambientes containerizados
5. **CI/CD**: Considere gerar CDS durante build do container

## 🔄 Manutenção

### Quando Regenerar CDS:
- Após atualizações de dependências
- Mudanças significativas no código
- Upgrade da versão do Java
- Mudanças na configuração do Spring Boot

### Automação:
```bash
# Adicionar ao pipeline CI/CD
./generate-cds.sh
docker build -f docker/Dockerfile.cds -t app:latest .
```

## 📚 Referências

- [OpenJDK CDS Documentation](https://openjdk.org/jeps/310)
- [Spring Boot Performance Tips](https://spring.io/blog/2018/12/12/how-fast-is-spring)
- [Java 21 Performance Improvements](https://openjdk.org/projects/jdk/21/)
