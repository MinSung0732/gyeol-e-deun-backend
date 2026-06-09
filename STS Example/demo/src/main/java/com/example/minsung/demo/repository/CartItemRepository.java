package com.example.minsung.demo.repository;

import com.example.minsung.demo.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByMember_MemberIdAndProduct_ProductId(Long memberId, Long productId);
    List<CartItem> findByMember_MemberId(Long memberId);
}
