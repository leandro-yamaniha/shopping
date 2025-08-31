package com.shopping.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@Order(-1) // Executar antes de outros filtros
public class RequestLoggingFilter implements WebFilter {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        
        long startTime = System.currentTimeMillis();
        String timestamp = LocalDateTime.now().format(FORMATTER);
        
        // Log da requisição de entrada
        log.info("📥 [{}] {} {} - {}", 
            timestamp,
            request.getMethod(), 
            request.getURI(), 
            request.getRemoteAddress());
        
        // Log headers importantes
        String userAgent = request.getHeaders().getFirst("User-Agent");
        String contentType = request.getHeaders().getFirst("Content-Type");
        String authorization = request.getHeaders().getFirst("Authorization");
        
        if (userAgent != null) {
            log.debug("🔍 User-Agent: {}", userAgent);
        }
        if (contentType != null) {
            log.debug("📄 Content-Type: {}", contentType);
        }
        if (authorization != null) {
            log.debug("🔐 Authorization: Bearer ***");
        }
        
        return chain.filter(exchange)
            .doOnSuccess(aVoid -> {
                long duration = System.currentTimeMillis() - startTime;
                log.info("📤 [{}] {} {} - Status: {} - Tempo: {}ms", 
                    LocalDateTime.now().format(FORMATTER),
                    request.getMethod(), 
                    request.getURI(), 
                    response.getStatusCode(),
                    duration);
            })
            .doOnError(throwable -> {
                long duration = System.currentTimeMillis() - startTime;
                log.error("❌ [{}] {} {} - ERRO: {} - Tempo: {}ms", 
                    LocalDateTime.now().format(FORMATTER),
                    request.getMethod(), 
                    request.getURI(), 
                    throwable.getMessage(),
                    duration);
            });
    }
}
