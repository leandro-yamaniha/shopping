package com.shopping.repository;

import com.shopping.model.ShoppingCart;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ShoppingCartRepository extends R2dbcRepository<ShoppingCart, UUID> {
    
    Mono<ShoppingCart> findByUserId(UUID userId);
    
    @Query("DELETE FROM shopping_carts WHERE user_id = :userId")
    Mono<Void> deleteByUserId(UUID userId);
    
    Mono<Boolean> existsByUserId(UUID userId);
}
