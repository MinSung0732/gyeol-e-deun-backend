package com.example.minsung.demo.dto.wishlistDto;

import com.example.minsung.demo.entity.WishlistItem;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WishlistItemResponseDto {
    private Long wishlistItemId;
    private Long productId;
    private String productName;
    private int price;
    private String primaryImageUrl;

    public WishlistItemResponseDto(WishlistItem wishlistItem) {
        this.wishlistItemId = wishlistItem.getWishlistItemId();
        this.productId = wishlistItem.getProduct().getProductId();
        this.productName = wishlistItem.getProduct().getName();
        this.price = wishlistItem.getProduct().getPrice();
        this.primaryImageUrl = wishlistItem.getProduct().getThumbnailUrl(); // 수정된 부분
    }
}
