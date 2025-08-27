package com.shopping.repository;

import com.shopping.model.OrderItem;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface OrderItemRepository extends R2dbcRepository<OrderItem, UUID> {
    
    Flux<OrderItem> findByOrderId(UUID orderId);
    
    @Query("SELECT * FROM order_items WHERE product_id = :productId")
    Flux<OrderItem> findByProductId(UUID productId);
    
    @Query("DELETE FROM order_items WHERE order_id = :orderId")
    Mono<Void> deleteByOrderId(UUID orderId);
    
    @Query("SELECT COUNT(*) FROM order_items WHERE order_id = :orderId")
    Mono<Long> countByOrderId(UUID orderId);
    
    @Query("SELECT SUM(total_price) FROM order_items WHERE order_id = :orderId")
    Mono<Double> getTotalAmountByOrderId(UUID orderId);
}
