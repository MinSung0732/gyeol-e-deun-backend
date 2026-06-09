package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.cartDto.CartItemAddRequestDto;
import com.example.minsung.demo.dto.cartDto.CartItemResponseDto;
import com.example.minsung.demo.service.cartService.CartService;
import com.example.minsung.demo.util.SecurityUtil;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping
    public ResponseEntity<?> addCartItem(@RequestBody CartItemAddRequestDto dto) {
        try {
            cartService.addCartItem(SecurityUtil.getCurrentLoginId(), dto);
            return ResponseEntity.ok("장바구니에 상품을 안전하게 담았습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("장바구니 담기에 실패했습니다.");
        }
    }

    @GetMapping
    public ResponseEntity<List<CartItemResponseDto>> getCartItems() {
        return ResponseEntity.ok(cartService.getCartItems(SecurityUtil.getCurrentLoginId()));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<String> deleteCartItem(@PathVariable("cartItemId") Long cartItemId) {
        try {
            cartService.deleteCartItem(SecurityUtil.getCurrentLoginId(), cartItemId);
            return ResponseEntity.ok("장바구니 상품이 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
