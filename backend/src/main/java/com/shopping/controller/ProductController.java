package com.shopping.controller;

import com.shopping.model.Product;
import com.shopping.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:19006"})
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public Flux<Product> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/products - Getting products with pagination: page {}, size {}", page, size);
        
        if (page == 0 && size == 20) {
            return productService.getAllActiveProducts();
        }
        return productService.getProductsWithPagination(page, size);
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<Product>> getProductById(@PathVariable UUID id) {
        log.info("GET /api/products/{} - Getting product by id", id);
        
        return productService.getProductById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/sku/{sku}")
    public Mono<ResponseEntity<Product>> getProductBySku(@PathVariable String sku) {
        log.info("GET /api/products/sku/{} - Getting product by SKU", sku);
        
        return productService.getProductBySku(sku)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/category/{categoryId}")
    public Flux<Product> getProductsByCategory(@PathVariable UUID categoryId) {
        log.info("GET /api/products/category/{} - Getting products by category", categoryId);
        return productService.getProductsByCategory(categoryId);
    }
    
    @GetMapping("/search")
    public Flux<Product> searchProducts(@RequestParam String name) {
        log.info("GET /api/products/search?name={} - Searching products", name);
        return productService.searchProducts(name);
    }
    
    @GetMapping("/price-range")
    public Flux<Product> getProductsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        log.info("GET /api/products/price-range?minPrice={}&maxPrice={} - Getting products by price range", minPrice, maxPrice);
        return productService.getProductsByPriceRange(minPrice, maxPrice);
    }
    
    @GetMapping("/in-stock")
    public Flux<Product> getInStockProducts() {
        log.info("GET /api/products/in-stock - Getting in-stock products");
        return productService.getInStockProducts();
    }
    
    @GetMapping("/latest")
    public Flux<Product> getLatestProducts(@RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/products/latest?limit={} - Getting latest products", limit);
        return productService.getLatestProducts(limit);
    }
    
    @PostMapping
    public Mono<ResponseEntity<Product>> createProduct(@Valid @RequestBody Product product) {
        log.info("POST /api/products - Creating product: {}", product.getName());
        
        return productService.createProduct(product)
            .map(createdProduct -> ResponseEntity.status(HttpStatus.CREATED).body(createdProduct))
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<Product>> updateProduct(@PathVariable UUID id, @Valid @RequestBody Product product) {
        log.info("PUT /api/products/{} - Updating product", id);
        
        return productService.updateProduct(id, product)
            .map(ResponseEntity::ok)
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteProduct(@PathVariable UUID id) {
        log.info("DELETE /api/products/{} - Deleting product", id);
        
        return productService.deleteProduct(id)
            .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }
    
    @PatchMapping("/{id}/deactivate")
    public Mono<ResponseEntity<Void>> deactivateProduct(@PathVariable UUID id) {
        log.info("PATCH /api/products/{}/deactivate - Deactivating product", id);
        
        return productService.deactivateProduct(id)
            .then(Mono.just(ResponseEntity.ok().<Void>build()))
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/stock")
    public Mono<ResponseEntity<Product>> updateStock(@PathVariable UUID id, @RequestParam int quantity) {
        log.info("PATCH /api/products/{}/stock?quantity={} - Updating stock", id, quantity);
        
        return productService.updateStock(id, quantity)
            .map(ResponseEntity::ok)
            .onErrorReturn(IllegalArgumentException.class, 
                ResponseEntity.badRequest().build());
    }
    
    @GetMapping("/count")
    public Mono<Long> countActiveProducts() {
        log.info("GET /api/products/count - Counting active products");
        return productService.countActiveProducts();
    }
    
    @GetMapping("/category/{categoryId}/count")
    public Mono<Long> countProductsByCategory(@PathVariable UUID categoryId) {
        log.info("GET /api/products/category/{}/count - Counting products by category", categoryId);
        return productService.countProductsByCategory(categoryId);
    }
}
