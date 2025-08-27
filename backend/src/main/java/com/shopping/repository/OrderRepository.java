package com.shopping.repository;

import com.shopping.model.Order;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface OrderRepository extends R2dbcRepository<Order, UUID> {
    
    Flux<Order> findByUserId(UUID userId);
    
    @Query("SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC")
    Flux<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    Mono<Order> findByOrderNumber(String orderNumber);
    
    @Query("SELECT * FROM orders WHERE status = :status")
    Flux<Order> findByStatus(Order.OrderStatus status);
    
    @Query("SELECT * FROM orders WHERE payment_status = :paymentStatus")
    Flux<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus);
    
    @Query("SELECT * FROM orders WHERE created_at BETWEEN :startDate AND :endDate")
    Flux<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(*) FROM orders WHERE user_id = :userId")
    Mono<Long> countByUserId(UUID userId);
    
    @Query("SELECT COUNT(*) FROM orders WHERE status = :status")
    Mono<Long> countByStatus(Order.OrderStatus status);
    
    @Query("SELECT * FROM orders ORDER BY created_at DESC LIMIT :limit OFFSET :offset")
    Flux<Order> findAllWithPagination(int limit, int offset);
}
