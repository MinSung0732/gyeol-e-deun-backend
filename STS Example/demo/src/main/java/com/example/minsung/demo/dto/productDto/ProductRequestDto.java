package com.example.minsung.demo.dto.productDto;

public class ProductRequestDto {
    private String name;
    private int price;
    private int stock;
    private String description;
    private String status; // "ON_SALE" 등

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
}