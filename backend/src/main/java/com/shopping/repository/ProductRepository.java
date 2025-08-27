package com.shopping.repository;

import com.shopping.model.Product;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface ProductRepository extends R2dbcRepository<Product, UUID> {
    
    @Query("SELECT * FROM products WHERE is_active = true")
    Flux<Product> findAllActive();
    
    @Query("SELECT * FROM products WHERE category_id = :categoryId AND is_active = true")
    Flux<Product> findByCategoryIdAndIsActiveTrue(UUID categoryId);
    
    @Query("SELECT * FROM products WHERE LOWER(name) LIKE LOWER(CONCAT('%', :name, '%')) AND is_active = true")
    Flux<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    @Query("SELECT * FROM products WHERE price BETWEEN :minPrice AND :maxPrice AND is_active = true")
    Flux<Product> findByPriceBetweenAndIsActiveTrue(BigDecimal minPrice, BigDecimal maxPrice);
    
    @Query("SELECT * FROM products WHERE stock_quantity > 0 AND is_active = true")
    Flux<Product> findInStock();
    
    @Query("SELECT * FROM products WHERE sku = :sku")
    Mono<Product> findBySku(String sku);
    
    @Query("SELECT COUNT(*) FROM products WHERE is_active = true")
    Mono<Long> countActiveProducts();
    
    @Query("SELECT COUNT(*) FROM products WHERE category_id = :categoryId AND is_active = true")
    Mono<Long> countByCategoryId(UUID categoryId);
    
    @Query("SELECT * FROM products WHERE category_id = :categoryId AND is_active = true ORDER BY name ASC LIMIT :limit OFFSET :offset")
    Flux<Product> findByCategoryIdWithPagination(UUID categoryId, int limit, int offset);
    
    @Query("SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC LIMIT :limit")
    Flux<Product> findLatestProducts(int limit);
    
    @Query("SELECT * FROM products WHERE is_active = true ORDER BY name ASC LIMIT :limit OFFSET :offset")
    Flux<Product> findAllWithPagination(int limit, int offset);
}
