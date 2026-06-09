package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.cartDto.CartItemAddRequestDto;
import com.example.minsung.demo.dto.cartDto.CartItemResponseDto;
import com.example.minsung.demo.service.cartService.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // 장바구니 상품 추가
    @PostMapping
    public ResponseEntity<?> addCartItem(@RequestBody CartItemAddRequestDto dto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }

            // 로그인된 아이디 가져오기
            String loginId = authentication.getName(); 
            
            cartService.addCartItem(loginId, dto);

            return ResponseEntity.ok("장바구니에 상품을 안전하게 담았습니다.");
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("장바구니 담기에 실패했습니다.");
        }
    }

    // 장바구니 목록 조회
    @GetMapping
    public ResponseEntity<?> getCartItems() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }

            String loginId = authentication.getName();
            List<CartItemResponseDto> cartItems = cartService.getCartItems(loginId);
            return ResponseEntity.ok(cartItems);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("장바구니를 불러오는데 실패했습니다.");
        }
    }

    // 장바구니 상품 삭제
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> deleteCartItem(@PathVariable Long cartItemId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }

            String loginId = authentication.getName();
            cartService.deleteCartItem(loginId, cartItemId);
            return ResponseEntity.ok("장바구니 상품이 삭제되었습니다.");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("장바구니 상품 삭제에 실패했습니다.");
        }
    }
}
