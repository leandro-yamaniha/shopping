package com.shopping.service;

import com.shopping.model.CartItem;
import com.shopping.model.Order;
import com.shopping.model.OrderItem;
import com.shopping.repository.OrderItemRepository;
import com.shopping.repository.OrderRepository;
import com.shopping.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ShoppingCartService cartService;
    
    public Flux<Order> getAllOrders() {
        log.debug("Getting all orders");
        return orderRepository.findAll();
    }
    
    public Mono<Order> getOrderById(UUID id) {
        log.debug("Getting order by id: {}", id);
        return orderRepository.findById(id);
    }
    
    public Mono<Order> getOrderByNumber(String orderNumber) {
        log.debug("Getting order by number: {}", orderNumber);
        return orderRepository.findByOrderNumber(orderNumber);
    }
    
    public Flux<Order> getOrdersByUser(UUID userId) {
        log.debug("Getting orders for user: {}", userId);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Flux<Order> getOrdersByStatus(Order.OrderStatus status) {
        log.debug("Getting orders by status: {}", status);
        return orderRepository.findByStatus(status);
    }
    
    public Flux<OrderItem> getOrderItems(UUID orderId) {
        log.debug("Getting order items for order: {}", orderId);
        return orderItemRepository.findByOrderId(orderId);
    }
    
    public Mono<Order> createOrderFromCart(UUID userId, String shippingAddress, String billingAddress, String paymentMethod) {
        log.debug("Creating order from cart for user: {}", userId);
        
        return cartService.validateCartStock(userId)
            .flatMap(stockValid -> {
                if (!stockValid) {
                    return Mono.error(new IllegalArgumentException("Some items in cart are out of stock"));
                }
                
                return cartService.getCartItems(userId)
                    .collectList()
                    .flatMap(cartItems -> {
                        if (cartItems.isEmpty()) {
                            return Mono.error(new IllegalArgumentException("Cart is empty"));
                        }
                        
                        // Calculate total
                        BigDecimal totalAmount = cartItems.stream()
                            .map(CartItem::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                        
                        // Create order
                        Order order = Order.builder()
                            .id(UUID.randomUUID())
                            .userId(userId)
                            .orderNumber(generateOrderNumber())
                            .status(Order.OrderStatus.PENDING)
                            .totalAmount(totalAmount)
                            .shippingAddress(shippingAddress)
                            .billingAddress(billingAddress)
                            .paymentMethod(paymentMethod)
                            .paymentStatus(Order.PaymentStatus.PENDING)
                            .build();
                        
                        return orderRepository.save(order)
                            .flatMap(savedOrder -> 
                                // Create order items and update stock
                                Flux.fromIterable(cartItems)
                                    .flatMap(cartItem -> 
                                        createOrderItem(savedOrder.getId(), cartItem)
                                            .then(updateProductStock(cartItem.getProductId(), -cartItem.getQuantity()))
                                    )
                                    .then(cartService.clearCart(userId))
                                    .thenReturn(savedOrder)
                            );
                    });
            });
    }
    
    private Mono<OrderItem> createOrderItem(UUID orderId, CartItem cartItem) {
        OrderItem orderItem = OrderItem.builder()
            .id(UUID.randomUUID())
            .orderId(orderId)
            .productId(cartItem.getProductId())
            .quantity(cartItem.getQuantity())
            .unitPrice(cartItem.getUnitPrice())
            .totalPrice(cartItem.getTotalPrice())
            .build();
        
        return orderItemRepository.save(orderItem);
    }
    
    private Mono<Void> updateProductStock(UUID productId, int quantityChange) {
        return productRepository.findById(productId)
            .flatMap(product -> {
                int newStock = product.getStockQuantity() + quantityChange;
                if (newStock < 0) {
                    return Mono.error(new IllegalArgumentException("Insufficient stock"));
                }
                product.setStockQuantity(newStock);
                return productRepository.save(product);
            })
            .then();
    }
    
    public Mono<Order> updateOrderStatus(UUID orderId, Order.OrderStatus status) {
        log.debug("Updating order status - Order: {}, Status: {}", orderId, status);
        
        return orderRepository.findById(orderId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Order not found")))
            .flatMap(order -> {
                order.setStatus(status);
                return orderRepository.save(order);
            });
    }
    
    public Mono<Order> updatePaymentStatus(UUID orderId, Order.PaymentStatus paymentStatus) {
        log.debug("Updating payment status - Order: {}, Status: {}", orderId, paymentStatus);
        
        return orderRepository.findById(orderId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Order not found")))
            .flatMap(order -> {
                order.setPaymentStatus(paymentStatus);
                return orderRepository.save(order);
            });
    }
    
    public Mono<Void> cancelOrder(UUID orderId) {
        log.debug("Cancelling order: {}", orderId);
        
        return orderRepository.findById(orderId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Order not found")))
            .flatMap(order -> {
                if (!order.canBeCancelled()) {
                    return Mono.error(new IllegalArgumentException("Order cannot be cancelled"));
                }
                
                // Restore stock
                return orderItemRepository.findByOrderId(orderId)
                    .flatMap(orderItem -> 
                        updateProductStock(orderItem.getProductId(), orderItem.getQuantity())
                    )
                    .then(updateOrderStatus(orderId, Order.OrderStatus.CANCELLED))
                    .then();
            });
    }
    
    public Mono<Long> countOrdersByUser(UUID userId) {
        log.debug("Counting orders for user: {}", userId);
        return orderRepository.countByUserId(userId);
    }
    
    public Mono<Long> countOrdersByStatus(Order.OrderStatus status) {
        log.debug("Counting orders by status: {}", status);
        return orderRepository.countByStatus(status);
    }
    
    public Flux<Order> getOrdersWithPagination(int page, int size) {
        log.debug("Getting orders with pagination: page {}, size {}", page, size);
        int offset = page * size;
        return orderRepository.findAllWithPagination(size, offset);
    }
    
    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.valueOf((int) (Math.random() * 1000));
        return "ORD-" + timestamp + "-" + random;
    }
}
