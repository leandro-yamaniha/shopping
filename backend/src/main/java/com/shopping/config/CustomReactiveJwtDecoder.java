package com.shopping.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Map;

@Component
public class CustomReactiveJwtDecoder implements ReactiveJwtDecoder {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Override
    public Mono<Jwt> decode(String token) throws JwtException {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            Map<String, Object> headers = Map.of("alg", "HS256", "typ", "JWT");
            
            Jwt jwt = new Jwt(
                token,
                claims.getIssuedAt().toInstant(),
                claims.getExpiration().toInstant(),
                headers,
                claims
            );
            
            return Mono.just(jwt);
        } catch (Exception e) {
            return Mono.error(new JwtException("Invalid JWT token", e));
        }
    }
}
