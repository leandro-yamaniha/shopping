package com.shopping.controller;

import com.shopping.dto.CartSummaryDto;
import com.shopping.dto.ProductDto;
import com.shopping.dto.LoginRequest;
import com.shopping.dto.LoginResponse;
import com.shopping.dto.RegisterRequest;
import com.shopping.model.Product;
import com.shopping.model.CartItem;
import com.shopping.model.User;
import com.shopping.service.ProductService;
import com.shopping.service.ShoppingCartService;
import com.shopping.service.UserService;
import com.shopping.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/mobile")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:8090", "http://localhost:8090", "exp://127.0.0.1:8090", "exp://localhost:8090"})
public class MobileApiController {
    
    private final ProductService productService;
    private final ShoppingCartService cartService;
    private final UserService userService;
    private final JwtService jwtService;
    
    // Endpoints otimizados para mobile
    
    @GetMapping("/products")
    public Flux<ProductDto> getMobileProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /api/mobile/products - Mobile products request: category={}, search={}, page={}, size={}", 
                category, search, page, size);
        
        if (search != null && !search.trim().isEmpty()) {
            return productService.searchProducts(search)
                    .map(this::convertToDto)
                    .take(size);
        }
        
        if (category != null && !category.trim().isEmpty()) {
            return productService.getProductsByCategory(UUID.fromString(category))
                    .map(this::convertToDto)
                    .take(size);
        }
        
        return productService.getAllActiveProducts()
                .map(this::convertToDto)
                .skip(page * size)
                .take(size);
    }
    
    @GetMapping("/products/{id}")
    public Mono<ResponseEntity<ProductDto>> getMobileProduct(@PathVariable UUID id) {
        log.info("GET /api/mobile/products/{} - Getting mobile product details", id);
        
        return productService.getProductById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/categories")
    public Flux<String> getCategories() {
        log.info("GET /api/mobile/categories - Getting product categories");
        
        return productService.getAllActiveProducts()
                .map(product -> product.getCategoryId() != null ? product.getCategoryId().toString() : "Uncategorized")
                .distinct()
                .sort();
    }
    
    @PostMapping("/cart/{userId}/add")
    public Mono<ResponseEntity<CartSummaryDto>> addToCart(
            @PathVariable UUID userId,
            @RequestBody AddToCartRequest request) {
        
        log.info("POST /api/mobile/cart/{}/add - Adding to cart: productId={}, quantity={}", 
                userId, request.getProductId(), request.getQuantity());
        
        return cartService.addItemToCart(userId, request.getProductId(), request.getQuantity())
                .then(getCartSummary(userId))
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }
    
    @PutMapping("/cart/{userId}/update")
    public Mono<ResponseEntity<CartSummaryDto>> updateCartItem(
            @PathVariable UUID userId,
            @RequestBody UpdateCartRequest request) {
        
        log.info("PUT /api/mobile/cart/{}/update - Updating cart: productId={}, quantity={}", 
                userId, request.getProductId(), request.getQuantity());
        
        return cartService.updateCartItem(userId, request.getProductId(), request.getQuantity())
                .then(getCartSummary(userId))
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.badRequest().build());
    }
    
    @DeleteMapping("/cart/{userId}/remove/{productId}")
    public Mono<ResponseEntity<CartSummaryDto>> removeFromCart(
            @PathVariable UUID userId,
            @PathVariable UUID productId) {
        
        log.info("DELETE /api/mobile/cart/{}/remove/{} - Removing from cart", userId, productId);
        
        return cartService.removeItemFromCart(userId, productId)
                .then(getCartSummary(userId))
                .map(ResponseEntity::ok);
    }
    
    @GetMapping("/cart/{userId}")
    public Mono<CartSummaryDto> getCartSummary(@PathVariable UUID userId) {
        log.info("GET /api/mobile/cart/{} - Getting cart summary", userId);
        
        return cartService.getCartItems(userId)
                .collectList()
                .zipWith(cartService.getCartTotal(userId))
                .zipWith(cartService.getCartItemCount(userId))
                .map(tuple -> {
                    List<CartItem> items = tuple.getT1().getT1();
                    BigDecimal total = tuple.getT1().getT2();
                    Long count = tuple.getT2();
                    
                    return CartSummaryDto.builder()
                            .items(items)
                            .subtotal(total)
                            .shipping(calculateShipping(total))
                            .tax(calculateTax(total))
                            .total(calculateTotal(total))
                            .itemCount(count.intValue())
                            .build();
                });
    }
    
    @DeleteMapping("/cart/{userId}/clear")
    public Mono<ResponseEntity<Void>> clearCart(@PathVariable UUID userId) {
        log.info("DELETE /api/mobile/cart/{}/clear - Clearing cart", userId);
        
        return cartService.clearCart(userId)
                .then(Mono.just(ResponseEntity.ok().<Void>build()));
    }
    
    @GetMapping("/health")
    public Mono<ResponseEntity<String>> healthCheck() {
        return Mono.just(ResponseEntity.ok("Mobile API is healthy"));
    }
    
    // Mobile Authentication Endpoints
    @PostMapping("/auth/login")
    public Mono<ResponseEntity<LoginResponse>> mobileLogin(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/mobile/auth/login - Mobile login for: {}", request.getEmail());
        
        return userService.getUserByEmail(request.getEmail())
            .flatMap(user -> {
                return userService.validatePassword(request.getEmail(), request.getPassword())
                    .flatMap(isValid -> {
                        if (!isValid) {
                            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<LoginResponse>build());
                        }
                        
                        if (!user.getIsActive()) {
                            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<LoginResponse>build());
                        }
                        
                        String token = jwtService.generateToken(
                            user.getId(),
                            user.getEmail(),
                            user.getRole().name()
                        );
                        
                        LoginResponse response = LoginResponse.builder()
                            .token(token)
                            .userId(user.getId())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .role(user.getRole().name())
                            .build();
                        
                        return Mono.just(ResponseEntity.ok(response));
                    });
            })
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
    
    @PostMapping("/auth/register")
    public Mono<ResponseEntity<LoginResponse>> mobileRegister(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/mobile/auth/register - Mobile register for: {}", request.getEmail());
        
        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(request.getPassword())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phone(request.getPhone())
            .role(User.UserRole.CUSTOMER)
            .isActive(true)
            .build();
        
        return userService.createUser(user)
            .map(createdUser -> {
                String token = jwtService.generateToken(
                    createdUser.getId(),
                    createdUser.getEmail(),
                    createdUser.getRole().name()
                );
                
                LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .userId(createdUser.getId())
                    .email(createdUser.getEmail())
                    .firstName(createdUser.getFirstName())
                    .lastName(createdUser.getLastName())
                    .role(createdUser.getRole().name())
                    .build();
                
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            })
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @PostMapping("/auth/validate")
    public Mono<ResponseEntity<Boolean>> validateMobileToken(@RequestHeader("Authorization") String authHeader) {
        log.info("POST /api/mobile/auth/validate - Validating mobile token");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Mono.just(ResponseEntity.ok(false));
        }
        
        String token = authHeader.substring(7);
        boolean isValid = jwtService.isTokenValid(token);
        
        return Mono.just(ResponseEntity.ok(isValid));
    }
    
    // Helper methods
    private ProductDto convertToDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategoryId() != null ? product.getCategoryId().toString() : "Uncategorized")
                .imageUrl(product.getImageUrl())
                .stock(product.getStockQuantity())
                .rating(BigDecimal.ZERO) // Default rating, can be enhanced later
                .isActive(product.getIsActive())
                .build();
    }
    
    private BigDecimal calculateShipping(BigDecimal subtotal) {
        return subtotal.compareTo(new BigDecimal("50.00")) >= 0 
                ? BigDecimal.ZERO 
                : new BigDecimal("9.99");
    }
    
    private BigDecimal calculateTax(BigDecimal subtotal) {
        return subtotal.multiply(new BigDecimal("0.08")); // 8% tax
    }
    
    private BigDecimal calculateTotal(BigDecimal subtotal) {
        return subtotal.add(calculateShipping(subtotal)).add(calculateTax(subtotal));
    }
    
    // Request DTOs
    public static class AddToCartRequest {
        private UUID productId;
        private int quantity;
        
        public UUID getProductId() { return productId; }
        public void setProductId(UUID productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
    
    public static class UpdateCartRequest {
        private UUID productId;
        private int quantity;
        
        public UUID getProductId() { return productId; }
        public void setProductId(UUID productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
