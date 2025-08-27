package com.shopping.repository;

import com.shopping.model.CartItem;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface CartItemRepository extends R2dbcRepository<CartItem, UUID> {
    
    Flux<CartItem> findByCartId(UUID cartId);
    
    Mono<CartItem> findByCartIdAndProductId(UUID cartId, UUID productId);
    
    @Query("DELETE FROM cart_items WHERE cart_id = :cartId")
    Mono<Void> deleteByCartId(UUID cartId);
    
    @Query("DELETE FROM cart_items WHERE cart_id = :cartId AND product_id = :productId")
    Mono<Void> deleteByCartIdAndProductId(UUID cartId, UUID productId);
    
    @Query("SELECT COUNT(*) FROM cart_items WHERE cart_id = :cartId")
    Mono<Long> countByCartId(UUID cartId);
    
    @Query("SELECT SUM(quantity * unit_price) FROM cart_items WHERE cart_id = :cartId")
    Mono<Double> getTotalAmountByCartId(UUID cartId);
}
