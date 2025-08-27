package com.shopping.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("products")
public class Product {
    
    @Id
    private UUID id;
    
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    @Column("name")
    private String name;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Column("description")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column("price")
    private BigDecimal price;
    
    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Builder.Default
    @Column("stock_quantity")
    private Integer stockQuantity = 0;
    
    @Column("category_id")
    private UUID categoryId;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @Column("image_url")
    private String imageUrl;
    
    @Size(max = 100, message = "SKU must not exceed 100 characters")
    @Column("sku")
    private String sku;
    
    @Builder.Default
    @Column("is_active")
    private Boolean isActive = true;
    
    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    @Column("weight")
    private BigDecimal weight;
    
    @Size(max = 100, message = "Dimensions must not exceed 100 characters")
    @Column("dimensions")
    private String dimensions;
    
    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column("updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }
    
    public boolean isAvailable() {
        return isActive && isInStock();
    }
    
    public void decreaseStock(int quantity) {
        if (stockQuantity >= quantity) {
            stockQuantity -= quantity;
        } else {
            throw new IllegalArgumentException("Insufficient stock");
        }
    }
    
    public void increaseStock(int quantity) {
        stockQuantity += quantity;
    }
}
