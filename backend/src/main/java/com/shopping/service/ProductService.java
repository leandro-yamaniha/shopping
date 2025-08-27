package com.shopping.service;

import com.shopping.model.Product;
import com.shopping.repository.ProductRepository;
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
public class ProductService {
    
    private final ProductRepository productRepository;
    
    public Flux<Product> getAllProducts() {
        log.debug("Getting all products");
        return productRepository.findAll();
    }
    
    public Flux<Product> getAllActiveProducts() {
        log.debug("Getting all active products");
        return productRepository.findAllActive();
    }
    
    public Mono<Product> getProductById(UUID id) {
        log.debug("Getting product by id: {}", id);
        return productRepository.findById(id);
    }
    
    public Mono<Product> getProductBySku(String sku) {
        log.debug("Getting product by SKU: {}", sku);
        return productRepository.findBySku(sku);
    }
    
    public Flux<Product> getProductsByCategory(UUID categoryId) {
        log.debug("Getting products by category: {}", categoryId);
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }
    
    public Flux<Product> searchProducts(String name) {
        log.debug("Searching products by name: {}", name);
        return productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
    }
    
    public Flux<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        log.debug("Getting products by price range: {} - {}", minPrice, maxPrice);
        return productRepository.findByPriceBetweenAndIsActiveTrue(minPrice, maxPrice);
    }
    
    public Flux<Product> getInStockProducts() {
        log.debug("Getting in-stock products");
        return productRepository.findInStock();
    }
    
    public Flux<Product> getLatestProducts(int limit) {
        log.debug("Getting latest {} products", limit);
        return productRepository.findLatestProducts(limit);
    }
    
    public Flux<Product> getProductsWithPagination(int page, int size) {
        log.debug("Getting products with pagination: page {}, size {}", page, size);
        int offset = page * size;
        return productRepository.findAllWithPagination(size, offset);
    }
    
    public Mono<Product> createProduct(Product product) {
        log.debug("Creating product: {}", product.getName());
        
        return Mono.justOrEmpty(product.getSku())
            .flatMap(sku -> productRepository.findBySku(sku)
                .hasElement()
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new IllegalArgumentException("Product with SKU already exists"));
                    }
                    return Mono.just(product);
                }))
            .switchIfEmpty(Mono.just(product))
            .flatMap(p -> {
                p.setId(UUID.randomUUID());
                return productRepository.save(p);
            });
    }
    
    public Mono<Product> updateProduct(UUID id, Product product) {
        log.debug("Updating product with id: {}", id);
        
        return productRepository.findById(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found")))
            .flatMap(existingProduct -> {
                // Update fields
                existingProduct.setName(product.getName());
                existingProduct.setDescription(product.getDescription());
                existingProduct.setPrice(product.getPrice());
                existingProduct.setStockQuantity(product.getStockQuantity());
                existingProduct.setCategoryId(product.getCategoryId());
                existingProduct.setImageUrl(product.getImageUrl());
                existingProduct.setIsActive(product.getIsActive());
                existingProduct.setWeight(product.getWeight());
                existingProduct.setDimensions(product.getDimensions());
                
                return productRepository.save(existingProduct);
            });
    }
    
    public Mono<Void> deleteProduct(UUID id) {
        log.debug("Deleting product with id: {}", id);
        return productRepository.deleteById(id);
    }
    
    public Mono<Void> deactivateProduct(UUID id) {
        log.debug("Deactivating product with id: {}", id);
        
        return productRepository.findById(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found")))
            .flatMap(product -> {
                product.setIsActive(false);
                return productRepository.save(product);
            })
            .then();
    }
    
    public Mono<Product> updateStock(UUID id, int quantity) {
        log.debug("Updating stock for product {}: {}", id, quantity);
        
        return productRepository.findById(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found")))
            .flatMap(product -> {
                if (quantity < 0 && Math.abs(quantity) > product.getStockQuantity()) {
                    return Mono.error(new IllegalArgumentException("Insufficient stock"));
                }
                
                product.setStockQuantity(product.getStockQuantity() + quantity);
                return productRepository.save(product);
            });
    }
    
    public Mono<Long> countActiveProducts() {
        log.debug("Counting active products");
        return productRepository.countActiveProducts();
    }
    
    public Mono<Long> countProductsByCategory(UUID categoryId) {
        log.debug("Counting products by category: {}", categoryId);
        return productRepository.countByCategoryId(categoryId);
    }
}
