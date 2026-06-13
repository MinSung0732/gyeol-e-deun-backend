package com.example.minsung.demo.dto.productDto;

import java.util.List;

public class ProductSearchStatRequestDto {
    private String keyword;
    private List<Long> productIds;

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public List<Long> getProductIds() { return productIds; }
    public void setProductIds(List<Long> productIds) { this.productIds = productIds; }
}
