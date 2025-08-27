package com.shopping.controller;

import com.shopping.model.CartItem;
import com.shopping.service.ShoppingCartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:19006"})
public class ShoppingCartController {
    
    private final ShoppingCartService cartService;
    
    @GetMapping("/{userId}")
    public Flux<CartItem> getCartItems(@PathVariable UUID userId) {
        log.info("GET /api/cart/{} - Getting cart items for user", userId);
        return cartService.getCartItems(userId);
    }
    
    @PostMapping("/{userId}/items")
    public Mono<ResponseEntity<CartItem>> addItemToCart(
            @PathVariable UUID userId,
            @RequestParam UUID productId,
            @RequestParam int quantity) {
        log.info("POST /api/cart/{}/items - Adding item to cart: product={}, quantity={}", userId, productId, quantity);
        
        return cartService.addItemToCart(userId, productId, quantity)
            .map(ResponseEntity::ok)
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @PutMapping("/{userId}/items/{productId}")
    public Mono<ResponseEntity<CartItem>> updateCartItem(
            @PathVariable UUID userId,
            @PathVariable UUID productId,
            @RequestParam int quantity) {
        log.info("PUT /api/cart/{}/items/{} - Updating cart item quantity: {}", userId, productId, quantity);
        
        return cartService.updateCartItem(userId, productId, quantity)
            .map(ResponseEntity::ok)
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @DeleteMapping("/{userId}/items/{productId}")
    public Mono<ResponseEntity<Void>> removeItemFromCart(
            @PathVariable UUID userId,
            @PathVariable UUID productId) {
        log.info("DELETE /api/cart/{}/items/{} - Removing item from cart", userId, productId);
        
        return cartService.removeItemFromCart(userId, productId)
            .then(Mono.just(ResponseEntity.ok().<Void>build()));
    }
    
    @DeleteMapping("/{userId}")
    public Mono<ResponseEntity<Void>> clearCart(@PathVariable UUID userId) {
        log.info("DELETE /api/cart/{} - Clearing cart", userId);
        
        return cartService.clearCart(userId)
            .then(Mono.just(ResponseEntity.ok().<Void>build()));
    }
    
    @GetMapping("/{userId}/total")
    public Mono<BigDecimal> getCartTotal(@PathVariable UUID userId) {
        log.info("GET /api/cart/{}/total - Getting cart total", userId);
        return cartService.getCartTotal(userId);
    }
    
    @GetMapping("/{userId}/count")
    public Mono<Long> getCartItemCount(@PathVariable UUID userId) {
        log.info("GET /api/cart/{}/count - Getting cart item count", userId);
        return cartService.getCartItemCount(userId);
    }
    
    @GetMapping("/{userId}/validate")
    public Mono<Boolean> validateCartStock(@PathVariable UUID userId) {
        log.info("GET /api/cart/{}/validate - Validating cart stock", userId);
        return cartService.validateCartStock(userId);
    }
}
