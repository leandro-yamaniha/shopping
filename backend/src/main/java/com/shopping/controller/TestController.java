package com.shopping.controller;

import com.shopping.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {
    
    private final JwtService jwtService;
    
    @GetMapping("/jwt")
    public Mono<ResponseEntity<Map<String, String>>> testJwt() {
        try {
            String token = jwtService.generateToken(
                UUID.randomUUID(),
                "test@example.com",
                "CUSTOMER"
            );
            
            return Mono.just(ResponseEntity.ok(Map.of(
                "status", "success",
                "token", token,
                "message", "JWT generation working"
            )));
        } catch (Exception e) {
            log.error("JWT test failed", e);
            return Mono.just(ResponseEntity.ok(Map.of(
                "status", "error",
                "message", e.getMessage()
            )));
        }
    }
}
