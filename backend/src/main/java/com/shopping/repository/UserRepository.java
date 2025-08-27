package com.shopping.repository;

import com.shopping.model.User;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface UserRepository extends R2dbcRepository<User, UUID> {
    
    Mono<User> findByEmail(String email);
    
    Mono<Boolean> existsByEmail(String email);
    
    @Query("SELECT * FROM users WHERE is_active = true")
    Flux<User> findAllActive();
    
    @Query("SELECT * FROM users WHERE role = :role")
    Flux<User> findByRole(User.UserRole role);
    
    @Query("SELECT * FROM users WHERE LOWER(first_name) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "OR LOWER(last_name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Flux<User> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT COUNT(*) FROM users WHERE is_active = true")
    Mono<Long> countActiveUsers();
}
