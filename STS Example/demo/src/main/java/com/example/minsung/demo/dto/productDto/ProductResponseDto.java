package com.example.minsung.demo.dto.productDto;

import com.example.minsung.demo.entity.Product;

import java.time.LocalDateTime;

public class ProductResponseDto {
    private Long productId;
    private String name;
    private int price;
    private int stock;
    private String description;
    private String status;
    private String thumbnailUrl;
    private String detailImageUrl;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponseDto(Product product) {
        this.productId = product.getProductId();
        this.name = product.getName();
        this.price = product.getPrice();
        this.stock = product.getStock();
        this.description = product.getDescription();
        this.status = product.getStatus();
        this.thumbnailUrl = product.getThumbnailUrl();
        this.detailImageUrl = product.getDetailImageUrl();
        this.category = product.getCategory();
        this.createdAt = product.getCreatedAt();
        this.updatedAt = product.getUpdatedAt();
    }

    public Long getProductId() { return productId; }
    public String getName() { return name; }
    public int getPrice() { return price; }
    public int getStock() { return stock; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getDetailImageUrl() { return detailImageUrl; }
    public String getCategory() { return category; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}