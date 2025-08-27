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
@Table("orders")
public class Order {
    
    @Id
    private UUID id;
    
    @NotNull(message = "User ID is required")
    @Column("user_id")
    private UUID userId;
    
    @NotBlank(message = "Order number is required")
    @Size(max = 50, message = "Order number must not exceed 50 characters")
    @Column("order_number")
    private String orderNumber;
    
    @Builder.Default
    @Column("status")
    private OrderStatus status = OrderStatus.PENDING;
    
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    @Column("total_amount")
    private BigDecimal totalAmount;
    
    @NotBlank(message = "Shipping address is required")
    @Column("shipping_address")
    private String shippingAddress;
    
    @Column("billing_address")
    private String billingAddress;
    
    @Size(max = 50, message = "Payment method must not exceed 50 characters")
    @Column("payment_method")
    private String paymentMethod;
    
    @Builder.Default
    @Column("payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Column("notes")
    private String notes;
    
    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column("updated_at")
    private LocalDateTime updatedAt;
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED
    }
    
    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED
    }
    
    // Helper methods
    public boolean canBeCancelled() {
        return status == OrderStatus.PENDING || status == OrderStatus.CONFIRMED;
    }
    
    public boolean isCompleted() {
        return status == OrderStatus.DELIVERED;
    }
    
    public boolean isPaid() {
        return paymentStatus == PaymentStatus.PAID;
    }
    
    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }
}
