package com.example.minsung.demo.dto.cartDto;

import com.example.minsung.demo.entity.CartItem;
import lombok.Data;

@Data
public class CartItemResponseDto {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private int price;
    private int count;
    private String status;
    private String primaryImageUrl;

    public CartItemResponseDto(CartItem cartItem) {
        this.cartItemId = cartItem.getCartItemId();
        this.productId = cartItem.getProduct().getProductId();
        this.productName = cartItem.getProduct().getName();
        this.price = cartItem.getProduct().getPrice();
        this.count = cartItem.getCount();
        this.status = cartItem.getProduct().getStatus();
        this.primaryImageUrl = cartItem.getProduct().getThumbnailUrl();
    }
}
