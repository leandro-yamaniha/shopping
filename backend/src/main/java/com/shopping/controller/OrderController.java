package com.shopping.controller;

import com.shopping.model.Order;
import com.shopping.model.OrderItem;
import com.shopping.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:19006", "http://127.0.0.1:8090", "http://localhost:8090"})
public class OrderController {
    
    private final OrderService orderService;
    
    @GetMapping
    public Flux<Order> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/orders - Getting orders with pagination: page {}, size {}", page, size);
        
        if (page == 0 && size == 20) {
            return orderService.getAllOrders();
        }
        return orderService.getOrdersWithPagination(page, size);
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<Order>> getOrderById(@PathVariable UUID id) {
        log.info("GET /api/orders/{} - Getting order by id", id);
        
        return orderService.getOrderById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{orderNumber}")
    public Mono<ResponseEntity<Order>> getOrderByNumber(@PathVariable String orderNumber) {
        log.info("GET /api/orders/number/{} - Getting order by number", orderNumber);
        
        return orderService.getOrderByNumber(orderNumber)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public Flux<Order> getOrdersByUser(@PathVariable UUID userId) {
        log.info("GET /api/orders/user/{} - Getting orders for user", userId);
        return orderService.getOrdersByUser(userId);
    }
    
    @GetMapping("/status/{status}")
    public Flux<Order> getOrdersByStatus(@PathVariable Order.OrderStatus status) {
        log.info("GET /api/orders/status/{} - Getting orders by status", status);
        return orderService.getOrdersByStatus(status);
    }
    
    @GetMapping("/{id}/items")
    public Flux<OrderItem> getOrderItems(@PathVariable UUID id) {
        log.info("GET /api/orders/{}/items - Getting order items", id);
        return orderService.getOrderItems(id);
    }
    
    @PostMapping("/create-from-cart")
    public Mono<ResponseEntity<Order>> createOrderFromCart(
            @RequestParam UUID userId,
            @RequestParam String shippingAddress,
            @RequestParam(required = false) String billingAddress,
            @RequestParam String paymentMethod) {
        log.info("POST /api/orders/create-from-cart - Creating order from cart for user: {}", userId);
        
        return orderService.createOrderFromCart(userId, shippingAddress, billingAddress, paymentMethod)
            .map(order -> ResponseEntity.status(HttpStatus.CREATED).body(order))
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @PatchMapping("/{id}/status")
    public Mono<ResponseEntity<Order>> updateOrderStatus(
            @PathVariable UUID id,
            @RequestParam Order.OrderStatus status) {
        log.info("PATCH /api/orders/{}/status - Updating order status to: {}", id, status);
        
        return orderService.updateOrderStatus(id, status)
            .map(ResponseEntity::ok)
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/payment-status")
    public Mono<ResponseEntity<Order>> updatePaymentStatus(
            @PathVariable UUID id,
            @RequestParam Order.PaymentStatus paymentStatus) {
        log.info("PATCH /api/orders/{}/payment-status - Updating payment status to: {}", id, paymentStatus);
        
        return orderService.updatePaymentStatus(id, paymentStatus)
            .map(ResponseEntity::ok)
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}/cancel")
    public Mono<ResponseEntity<Void>> cancelOrder(@PathVariable UUID id) {
        log.info("DELETE /api/orders/{}/cancel - Cancelling order", id);
        
        return orderService.cancelOrder(id)
            .then(Mono.just(ResponseEntity.ok().<Void>build()))
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @GetMapping("/user/{userId}/count")
    public Mono<Long> countOrdersByUser(@PathVariable UUID userId) {
        log.info("GET /api/orders/user/{}/count - Counting orders for user", userId);
        return orderService.countOrdersByUser(userId);
    }
    
    @GetMapping("/status/{status}/count")
    public Mono<Long> countOrdersByStatus(@PathVariable Order.OrderStatus status) {
        log.info("GET /api/orders/status/{}/count - Counting orders by status", status);
        return orderService.countOrdersByStatus(status);
    }
}
