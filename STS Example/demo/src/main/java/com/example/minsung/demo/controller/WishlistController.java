package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.wishlistDto.WishlistItemResponseDto;
import com.example.minsung.demo.service.wishlistService.WishlistService;
import com.example.minsung.demo.util.SecurityUtil;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable("productId") Long productId) {
        try {
            boolean isAdded = wishlistService.toggleWishlist(SecurityUtil.getCurrentLoginId(), productId);
            return ResponseEntity.ok(Map.of(
                "isAdded", isAdded,
                "message", isAdded ? "찜 목록에 추가되었습니다." : "찜 목록에서 제거되었습니다."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("찜하기 처리에 실패했습니다.");
        }
    }

    @GetMapping
    public ResponseEntity<List<WishlistItemResponseDto>> getWishlistItems() {
        return ResponseEntity.ok(wishlistService.getWishlistItems(SecurityUtil.getCurrentLoginId()));
    }
}
