package com.shopping.service;

import com.shopping.model.CartItem;
import com.shopping.model.Product;
import com.shopping.model.ShoppingCart;
import com.shopping.repository.CartItemRepository;
import com.shopping.repository.ProductRepository;
import com.shopping.repository.ShoppingCartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShoppingCartService {
    
    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    public Mono<ShoppingCart> getOrCreateCart(UUID userId) {
        log.debug("Getting or creating cart for user: {}", userId);
        
        return cartRepository.findByUserId(userId)
            .switchIfEmpty(createCart(userId));
    }
    
    private Mono<ShoppingCart> createCart(UUID userId) {
        log.debug("Creating new cart for user: {}", userId);
        
        ShoppingCart cart = ShoppingCart.builder()
            .id(UUID.randomUUID())
            .userId(userId)
            .build();
        
        return cartRepository.save(cart);
    }
    
    public Flux<CartItem> getCartItems(UUID userId) {
        log.debug("Getting cart items for user: {}", userId);
        
        return getOrCreateCart(userId)
            .flatMapMany(cart -> cartItemRepository.findByCartId(cart.getId()));
    }
    
    public Mono<CartItem> addItemToCart(UUID userId, UUID productId, int quantity) {
        log.debug("Adding item to cart - User: {}, Product: {}, Quantity: {}", userId, productId, quantity);
        
        return getOrCreateCart(userId)
            .flatMap(cart -> 
                productRepository.findById(productId)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found")))
                    .flatMap(product -> {
                        if (!product.isAvailable()) {
                            return Mono.error(new IllegalArgumentException("Product is not available"));
                        }
                        
                        if (product.getStockQuantity() < quantity) {
                            return Mono.error(new IllegalArgumentException("Insufficient stock"));
                        }
                        
                        return cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                            .flatMap(existingItem -> {
                                // Update existing item
                                int newQuantity = existingItem.getQuantity() + quantity;
                                if (product.getStockQuantity() < newQuantity) {
                                    return Mono.error(new IllegalArgumentException("Insufficient stock"));
                                }
                                existingItem.setQuantity(newQuantity);
                                return cartItemRepository.save(existingItem);
                            })
                            .switchIfEmpty(
                                // Create new item
                                Mono.defer(() -> {
                                    CartItem newItem = CartItem.builder()
                                        .id(UUID.randomUUID())
                                        .cartId(cart.getId())
                                        .productId(productId)
                                        .quantity(quantity)
                                        .unitPrice(product.getPrice())
                                        .build();
                                    
                                    return cartItemRepository.save(newItem);
                                })
                            );
                    })
            );
    }
    
    public Mono<CartItem> updateCartItem(UUID userId, UUID productId, int quantity) {
        log.debug("Updating cart item - User: {}, Product: {}, Quantity: {}", userId, productId, quantity);
        
        if (quantity <= 0) {
            return removeItemFromCart(userId, productId).then(Mono.empty());
        }
        
        return getOrCreateCart(userId)
            .flatMap(cart -> 
                cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("Cart item not found")))
                    .flatMap(cartItem -> 
                        productRepository.findById(productId)
                            .flatMap(product -> {
                                if (product.getStockQuantity() < quantity) {
                                    return Mono.error(new IllegalArgumentException("Insufficient stock"));
                                }
                                
                                cartItem.setQuantity(quantity);
                                return cartItemRepository.save(cartItem);
                            })
                    )
            );
    }
    
    public Mono<Void> removeItemFromCart(UUID userId, UUID productId) {
        log.debug("Removing item from cart - User: {}, Product: {}", userId, productId);
        
        return getOrCreateCart(userId)
            .flatMap(cart -> cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId));
    }
    
    public Mono<Void> clearCart(UUID userId) {
        log.debug("Clearing cart for user: {}", userId);
        
        return getOrCreateCart(userId)
            .flatMap(cart -> cartItemRepository.deleteByCartId(cart.getId()));
    }
    
    public Mono<BigDecimal> getCartTotal(UUID userId) {
        log.debug("Getting cart total for user: {}", userId);
        
        return getCartItems(userId)
            .map(CartItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public Mono<Long> getCartItemCount(UUID userId) {
        log.debug("Getting cart item count for user: {}", userId);
        
        return getOrCreateCart(userId)
            .flatMap(cart -> cartItemRepository.countByCartId(cart.getId()));
    }
    
    public Mono<Boolean> validateCartStock(UUID userId) {
        log.debug("Validating cart stock for user: {}", userId);
        
        return getCartItems(userId)
            .flatMap(cartItem -> 
                productRepository.findById(cartItem.getProductId())
                    .map(product -> product.getStockQuantity() >= cartItem.getQuantity())
            )
            .all(stockAvailable -> stockAvailable);
    }
}
