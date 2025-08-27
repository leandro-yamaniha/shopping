package com.shopping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;
import org.springframework.web.reactive.config.EnableWebFlux;

/**
 * Shopping App - Reactive E-commerce Backend
 * 
 * Features:
 * - Spring Boot 4.0 with Java 21
 * - Reactive programming with WebFlux
 * - R2DBC for reactive database access
 * - PostgreSQL database
 * - JWT authentication
 * - OpenAPI documentation
 */
@SpringBootApplication
@EnableWebFlux
@EnableR2dbcAuditing
public class ShoppingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShoppingApplication.class, args);
    }
}
