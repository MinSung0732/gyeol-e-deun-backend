package com.example.minsung.demo.dto.productDto;

import com.example.minsung.demo.entity.Product;

public class ProductResponseDto {
    // 프론트엔드 상품 목록 화면에서 보여줄 필수 정보들만 담습니다.
    private Long productId;
    private String name;
    private int price;
    private String status;
   private String thumbnailUrl; // 상품 목록에서 썸네일 이미지 URL도 보여주고 싶다면 추가할 수 있습니다.

    // 💡 생성자(Constructor): Entity(DB 알맹이)를 이 상자에 넣으면 알아서 포장해 주는 마법의 세팅
    public ProductResponseDto(Product product) {
        this.productId = product.getProductId();
        this.name = product.getName();
        this.price = product.getPrice();
        this.status = product.getStatus();
        this.thumbnailUrl = product.getThumbnailUrl(); // 썸네일 URL도 세팅
    }

    // Getter (나가는 상자는 데이터를 읽기만 하면 되므로 Setter는 굳이 필요 없습니다)
    public Long getProductId() { return productId; }
    public String getName() { return name; }
    public int getPrice() { return price; }
    public String getStatus() { return status; }
    public String getThumbnailUrl() { return thumbnailUrl; }
}