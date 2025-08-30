package com.shopping.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.UUID;


@Slf4j
@Service
public class JwtService {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration}")
    private long jwtExpiration;
    
    // Cache em memória para tokens validados (performance)
    private final Map<String, Claims> tokenCache = new ConcurrentHashMap<>();
    private final Map<String, Long> tokenCacheTimestamp = new ConcurrentHashMap<>();
    private static final long CACHE_TTL = 300000; // 5 minutos em milliseconds
    
    public String generateToken(UUID userId, String email, String role) {
        log.debug("Generating JWT token for user: {}", email);
        
        Instant now = Instant.now();
        Instant expiration = now.plus(jwtExpiration, ChronoUnit.MILLIS);
        
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiration))
            .signWith(key)
            .compact();
    }
    
    public Claims extractClaims(String token) {
        log.debug("Extracting claims from JWT token");
        
        // Verificar cache primeiro (performance boost)
        Claims cachedClaims = getCachedClaims(token);
        if (cachedClaims != null) {
            log.debug("JWT token encontrado no cache - performance otimizada");
            return cachedClaims;
        }
        
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        
        Claims claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        
        // Cachear o resultado para próximas validações
        cacheClaims(token, claims);
        
        return claims;
    }
    
    private Claims getCachedClaims(String token) {
        Long timestamp = tokenCacheTimestamp.get(token);
        if (timestamp != null && (System.currentTimeMillis() - timestamp) < CACHE_TTL) {
            return tokenCache.get(token);
        }
        // Limpar cache expirado
        tokenCache.remove(token);
        tokenCacheTimestamp.remove(token);
        return null;
    }
    
    private void cacheClaims(String token, Claims claims) {
        // Limitar tamanho do cache para evitar memory leak
        if (tokenCache.size() > 10000) {
            // Limpar 20% dos tokens mais antigos
            cleanOldTokens();
        }
        
        tokenCache.put(token, claims);
        tokenCacheTimestamp.put(token, System.currentTimeMillis());
    }
    
    private void cleanOldTokens() {
        long cutoffTime = System.currentTimeMillis() - CACHE_TTL;
        tokenCacheTimestamp.entrySet().removeIf(entry -> {
            if (entry.getValue() < cutoffTime) {
                tokenCache.remove(entry.getKey());
                return true;
            }
            return false;
        });
        log.debug("Cache de JWT tokens limpo - {} tokens restantes", tokenCache.size());
    }
    
    public UUID extractUserId(String token) {
        Claims claims = extractClaims(token);
        return UUID.fromString(claims.getSubject());
    }
    
    public String extractEmail(String token) {
        Claims claims = extractClaims(token);
        return claims.get("email", String.class);
    }
    
    public String extractRole(String token) {
        Claims claims = extractClaims(token);
        return claims.get("role", String.class);
    }
    
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
