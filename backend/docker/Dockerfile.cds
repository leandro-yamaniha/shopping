# Multi-stage Dockerfile com CDS para Shopping App Backend
# Java 21 + Spring Boot 3.5.5 + Class Data Sharing

FROM eclipse-temurin:21-jdk-alpine AS builder

# Instalar dependências
RUN apk add --no-cache maven

# Copiar código fonte
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Compilar aplicação
RUN mvn clean package -DskipTests

# Gerar CDS
COPY generate-cds.sh .
RUN chmod +x generate-cds.sh && \
    apk add --no-cache bash timeout && \
    ./generate-cds.sh

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

# Copiar arquivos da build
COPY --from=builder /app/target/shopping-backend-1.0.0.jar app.jar
COPY --from=builder /app/shopping-app.jsa shopping-app.jsa
COPY --from=builder /app/shopping-classes.lst shopping-classes.lst
COPY cds-startup.sh .
COPY .jvmopts-cds .

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
