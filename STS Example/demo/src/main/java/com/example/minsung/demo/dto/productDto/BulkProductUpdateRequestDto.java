package com.example.minsung.demo.dto.productDto;

import java.util.List;

public class BulkProductUpdateRequestDto {
    private List<Long> productIds;
    private String status;
    private Integer discountPercent;
    private Boolean resetDiscount;
    private Integer originalPrice;
    private Integer stock;
    private Boolean restoreSoldOut;
    private Boolean restoreHidden;

    public List<Long> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Long> productIds) {
        this.productIds = productIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Integer discountPercent) {
        this.discountPercent = discountPercent;
    }

    public Boolean getResetDiscount() {
        return resetDiscount;
    }

    public void setResetDiscount(Boolean resetDiscount) {
        this.resetDiscount = resetDiscount;
    }

    public Integer getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Integer originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Boolean getRestoreSoldOut() {
        return restoreSoldOut;
    }

    public void setRestoreSoldOut(Boolean restoreSoldOut) {
        this.restoreSoldOut = restoreSoldOut;
    }

    public Boolean getRestoreHidden() {
        return restoreHidden;
    }

    public void setRestoreHidden(Boolean restoreHidden) {
        this.restoreHidden = restoreHidden;
    }
}
