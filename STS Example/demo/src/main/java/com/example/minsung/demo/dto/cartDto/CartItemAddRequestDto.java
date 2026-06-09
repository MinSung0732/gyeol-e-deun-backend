package com.example.minsung.demo.dto.cartDto;

import lombok.Data;

@Data
public class CartItemAddRequestDto {
    private Long productId;
    private int count;
}
