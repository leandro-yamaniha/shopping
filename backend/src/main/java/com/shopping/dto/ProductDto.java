package com.shopping.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ProductDto {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private int stock;
    private BigDecimal rating;
    private boolean isActive;
}
