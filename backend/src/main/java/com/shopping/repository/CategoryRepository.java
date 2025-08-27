package com.shopping.repository;

import com.shopping.model.Category;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface CategoryRepository extends R2dbcRepository<Category, UUID> {
    
    @Query("SELECT * FROM categories WHERE is_active = true ORDER BY name ASC")
    Flux<Category> findAllActive();
    
    @Query("SELECT * FROM categories WHERE LOWER(name) LIKE LOWER(CONCAT('%', :name, '%')) AND is_active = true")
    Flux<Category> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    Mono<Category> findByNameIgnoreCase(String name);
    
    Mono<Boolean> existsByNameIgnoreCase(String name);
    
    @Query("SELECT COUNT(*) FROM categories WHERE is_active = true")
    Mono<Long> countActiveCategories();
}
