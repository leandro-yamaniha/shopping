package com.shopping.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("users")
public class User {
    
    @Id
    private UUID id;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column("email")
    private String email;
    
    @JsonIgnore
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column("password_hash")
    private String passwordHash;
    
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Column("first_name")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Column("last_name")
    private String lastName;
    
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column("phone")
    private String phone;
    
    @Builder.Default
    @Column("is_active")
    private Boolean isActive = true;
    
    @Builder.Default
    @Column("role")
    private UserRole role = UserRole.CUSTOMER;
    
    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column("updated_at")
    private LocalDateTime updatedAt;
    
    public enum UserRole {
        CUSTOMER, ADMIN, MANAGER
    }
    
    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isAdmin() {
        return role == UserRole.ADMIN || role == UserRole.MANAGER;
    }
}
