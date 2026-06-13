package com.example.minsung.demo.repository;

import com.example.minsung.demo.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByMember_MemberIdAndProduct_ProductId(Long memberId, Long productId);
    List<WishlistItem> findByMember_MemberId(Long memberId);
    void deleteByProduct_ProductIdIn(List<Long> productIds);
}
