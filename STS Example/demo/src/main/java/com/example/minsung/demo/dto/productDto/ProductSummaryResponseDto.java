package com.example.minsung.demo.dto.productDto;

import java.util.List;

public class ProductSummaryResponseDto {
    private List<TopProductStatDto> topSellingProducts;
    private List<TopProductStatDto> topSearchedProducts;
    private List<TopProductStatDto> topViewedProducts;
    private List<TopProductStatDto> salesIncreaseProducts;
    private List<TopProductStatDto> salesDecreaseProducts;

    public ProductSummaryResponseDto(
            List<TopProductStatDto> topSellingProducts,
            List<TopProductStatDto> topSearchedProducts,
            List<TopProductStatDto> topViewedProducts,
            List<TopProductStatDto> salesIncreaseProducts,
            List<TopProductStatDto> salesDecreaseProducts
    ) {
        this.topSellingProducts = topSellingProducts;
        this.topSearchedProducts = topSearchedProducts;
        this.topViewedProducts = topViewedProducts;
        this.salesIncreaseProducts = salesIncreaseProducts;
        this.salesDecreaseProducts = salesDecreaseProducts;
    }

    public List<TopProductStatDto> getTopSellingProducts() { return topSellingProducts; }
    public List<TopProductStatDto> getTopSearchedProducts() { return topSearchedProducts; }
    public List<TopProductStatDto> getTopViewedProducts() { return topViewedProducts; }
    public List<TopProductStatDto> getSalesIncreaseProducts() { return salesIncreaseProducts; }
    public List<TopProductStatDto> getSalesDecreaseProducts() { return salesDecreaseProducts; }
}
