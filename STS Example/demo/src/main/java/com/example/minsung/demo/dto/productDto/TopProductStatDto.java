package com.example.minsung.demo.dto.productDto;

public class TopProductStatDto {
    private Long productId;
    private String productName;
    private Long value;
    private Long previousValue;
    private Double changeRate;

    public TopProductStatDto(Long productId, String productName, Long value) {
        this(productId, productName, value, 0L, 0.0);
    }

    public TopProductStatDto(Long productId, String productName, Long value, Long previousValue, Double changeRate) {
        this.productId = productId;
        this.productName = productName;
        this.value = value == null ? 0L : value;
        this.previousValue = previousValue == null ? 0L : previousValue;
        this.changeRate = changeRate == null ? 0.0 : changeRate;
    }

    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public Long getValue() { return value; }
    public Long getPreviousValue() { return previousValue; }
    public Double getChangeRate() { return changeRate; }
}
