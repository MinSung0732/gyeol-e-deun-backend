package com.example.minsung.demo.service.wishlistService;

import com.example.minsung.demo.dto.wishlistDto.WishlistItemResponseDto;
import com.example.minsung.demo.entity.Member;
import com.example.minsung.demo.entity.Product;
import com.example.minsung.demo.entity.WishlistItem;
import com.example.minsung.demo.repository.MemberRepository;
import com.example.minsung.demo.repository.ProductRepository;
import com.example.minsung.demo.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public boolean toggleWishlist(String loginId, Long productId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        Optional<WishlistItem> existingItem = wishlistItemRepository.findByMember_MemberIdAndProduct_ProductId(member.getMemberId(), product.getProductId());

        if (existingItem.isPresent()) {
            wishlistItemRepository.delete(existingItem.get());
            return false; // Removed from wishlist
        } else {
            WishlistItem newItem = new WishlistItem();
            newItem.setMember(member);
            newItem.setProduct(product);
            wishlistItemRepository.save(newItem);
            return true; // Added to wishlist
        }
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponseDto> getWishlistItems(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        List<WishlistItem> items = wishlistItemRepository.findByMember_MemberId(member.getMemberId());

        return items.stream()
                .map(WishlistItemResponseDto::new)
                .collect(Collectors.toList());
    }
}
