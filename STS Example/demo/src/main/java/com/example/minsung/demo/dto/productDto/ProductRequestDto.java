package com.example.minsung.demo.dto.productDto;

public class ProductRequestDto {
    private String name;
    private int price;
    private int stock;
    private String description;
    private String status; // "ON_SALE" 등
    private String thumbnailUrl; // 사진 URL도 함께 받도록 필드 추가
    private String detailImageUrl; // 상세 이미지 URL 추가
    private String category; // 카테고리 정보도 추가

    // Getter와 Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getDetailImageUrl() { return detailImageUrl; }
    public void setDetailImageUrl(String detailImageUrl) { this.detailImageUrl = detailImageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}