package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.wishlistDto.WishlistItemResponseDto;
import com.example.minsung.demo.service.wishlistService.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long productId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }

            String loginId = authentication.getName();
            boolean isAdded = wishlistService.toggleWishlist(loginId, productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isAdded", isAdded);
            response.put("message", isAdded ? "찜 목록에 추가되었습니다." : "찜 목록에서 제거되었습니다.");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("찜하기 처리에 실패했습니다.");
        }
    }

    @GetMapping
    public ResponseEntity<?> getWishlistItems() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
            }

            String loginId = authentication.getName();
            List<WishlistItemResponseDto> items = wishlistService.getWishlistItems(loginId);
            return ResponseEntity.ok(items);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("찜 목록을 불러오는데 실패했습니다.");
        }
    }
}
