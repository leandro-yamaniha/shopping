package com.shopping.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.embedded.undertow.UndertowReactiveWebServerFactory;
import org.springframework.boot.web.embedded.undertow.UndertowBuilderCustomizer;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.undertow.Undertow;

@Slf4j
@Configuration
public class ServerLoggingConfig {

    @Bean
    public WebServerFactoryCustomizer<UndertowReactiveWebServerFactory> undertowCustomizer() {
        return factory -> {
            log.info("🚀 Configurando servidor Undertow embarcado...");
            
            // Configurar builder do Undertow
            factory.addBuilderCustomizers(new UndertowBuilderCustomizer() {
                @Override
                public void customize(Undertow.Builder builder) {
                    log.info("⚙️ Configurando Undertow Builder para alta performance...");
                    
                    // Configurar threads otimizadas baseado no número de CPUs
                    int cpuCount = Runtime.getRuntime().availableProcessors();
                    int ioThreads = Math.max(2, cpuCount);
                    int workerThreads = cpuCount * 16; // 16 workers por CPU core
                    
                    builder.setIoThreads(ioThreads);
                    builder.setWorkerThreads(workerThreads);
                    
                    // Configurações de performance avançadas
                    builder.setServerOption(org.xnio.Options.BACKLOG, 10000);
                    builder.setServerOption(org.xnio.Options.TCP_NODELAY, true);
                    builder.setServerOption(org.xnio.Options.REUSE_ADDRESSES, true);
                    builder.setServerOption(org.xnio.Options.KEEP_ALIVE, true);
                    builder.setServerOption(org.xnio.Options.CONNECTION_HIGH_WATER, 1000000);
                    builder.setServerOption(org.xnio.Options.CONNECTION_LOW_WATER, 1000000);
                    
                    // Buffer sizes otimizados
                    builder.setBufferSize(16384); // 16KB buffers
                    builder.setDirectBuffers(true); // Use direct memory buffers
                    
                    log.info("🧵 Worker Threads: {} ({}x CPU cores)", workerThreads, cpuCount);
                    log.info("🔄 IO Threads: {} (CPU cores: {})", ioThreads, cpuCount);
                    log.info("📊 Buffer Size: 16KB (Direct Buffers)");
                    log.info("🚀 TCP_NODELAY, KEEP_ALIVE, REUSE_ADDRESSES habilitados");
                }
            });
            
            // Configurar propriedades do servidor
            factory.setPort(8080);
            log.info("🌐 Servidor Undertow configurado na porta 8080");
            log.info("🔧 Servidor configurado e pronto para iniciar");
        };
    }
}
