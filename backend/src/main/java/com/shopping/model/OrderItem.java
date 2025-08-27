package com.shopping.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("order_items")
public class OrderItem {
    
    @Id
    private UUID id;
    
    @NotNull(message = "Order ID is required")
    @Column("order_id")
    private UUID orderId;
    
    @NotNull(message = "Product ID is required")
    @Column("product_id")
    private UUID productId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column("quantity")
    private Integer quantity;
    
    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
    @Column("unit_price")
    private BigDecimal unitPrice;
    
    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total price must be greater than 0")
    @Column("total_price")
    private BigDecimal totalPrice;
    
    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;
    
    // Helper methods
    public BigDecimal calculateTotalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    public void updateTotalPrice() {
        this.totalPrice = calculateTotalPrice();
    }
}
