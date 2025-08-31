package com.shopping.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        log.info("🗄️ Configurando Cache Manager para alta performance...");
        
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        
        // Configurar caches específicos
        cacheManager.setCacheNames(java.util.Arrays.asList("jwtTokens", "userSessions", "apiResponses"));
        cacheManager.setAllowNullValues(false);
        
        log.info("✅ Cache configurado: jwtTokens, userSessions, apiResponses");
        return cacheManager;
    }

    @Bean
    public WebFilter cacheHeadersFilter() {
        return new WebFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
                String path = exchange.getRequest().getPath().value();
                
                // Configurar cache headers para recursos estáticos
                if (path.contains("/swagger-ui/") || path.contains("/webjars/") || path.contains("/api-docs")) {
                    exchange.getResponse().getHeaders().add("Cache-Control", "public, max-age=3600"); // 1 hora
                } 
                // Configurar cache para endpoints de API
                else if (path.startsWith("/api/")) {
                    // Cache curto para APIs
                    exchange.getResponse().getHeaders().add("Cache-Control", "private, max-age=300"); // 5 minutos
                }
                // Configurar cache para actuator (health checks)
                else if (path.startsWith("/actuator/")) {
                    exchange.getResponse().getHeaders().add("Cache-Control", "no-cache, must-revalidate");
                }
                
                return chain.filter(exchange);
            }
        };
    }
}
