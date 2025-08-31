# Multi-stage Dockerfile com CDS + Layered JARs para Shopping App Backend
# Java 21 + Spring Boot 3.5.5 + Class Data Sharing + Layered JARs

FROM eclipse-temurin:21-jdk-alpine AS builder

# Instalar dependências
RUN apk add --no-cache maven

# Copiar código fonte
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Compilar aplicação com layered JARs habilitado
RUN mvn clean package -DskipTests

# Extrair layers do JAR para otimização Docker
RUN java -Djarmode=layertools -jar target/shopping-backend-1.0.0.jar extract

# === Imagem de produção ===
FROM eclipse-temurin:21-jre-alpine

# Metadados
LABEL maintainer="Shopping App Team"
LABEL description="Shopping App Backend with CDS optimization"
LABEL version="1.0.0"

# Criar usuário não-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Instalar dependências de runtime
RUN apk add --no-cache \
    bash \
    curl \
    tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone

# Configurar diretório de trabalho
WORKDIR /app

# Copiar layers do JAR extraído (otimização Docker)
# Copiar em ordem de mudança: dependencies -> spring-boot-loader -> snapshot-dependencies -> application
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

# Copiar scripts para geração de CDS no runtime
COPY docker/generate-cds-docker.sh ./generate-cds.sh
COPY docker/cds-startup-docker.sh cds-startup.sh
COPY startup-optimize/.jvmopts-cds .

# Instalar dependências para CDS
RUN apk add --no-cache bash coreutils

# Gerar CDS no ambiente de runtime (mesmo JRE)
RUN chmod +x generate-cds.sh && \
    ./generate-cds.sh

# Configurar permissões
RUN chmod +x cds-startup.sh && \
    chown -R appuser:appgroup /app

# Mudar para usuário não-root
USER appuser

# Configurar variáveis de ambiente
ENV JAVA_OPTS="-Dfile.encoding=UTF-8 -Duser.timezone=America/Sao_Paulo"
ENV SPRING_PROFILES_ACTIVE=docker
ENV SERVER_PORT=8080

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando de inicialização com CDS
CMD ["./cds-startup.sh"]
