package com.example.minsung.demo.service.cartService;

import com.example.minsung.demo.dto.cartDto.CartItemAddRequestDto;
import com.example.minsung.demo.dto.cartDto.CartItemResponseDto;
import com.example.minsung.demo.entity.CartItem;
import com.example.minsung.demo.entity.Member;
import com.example.minsung.demo.entity.Product;
import com.example.minsung.demo.repository.CartItemRepository;
import com.example.minsung.demo.repository.MemberRepository;
import com.example.minsung.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public void addCartItem(String loginId, CartItemAddRequestDto dto) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        if (Boolean.TRUE.equals(member.getBlacklisted())) {
            throw new IllegalArgumentException("구매가 제한된 회원입니다.");
        }

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 이미 장바구니에 있는 상품인지 확인
        Optional<CartItem> existingCartItem = cartItemRepository.findByMember_MemberIdAndProduct_ProductId(member.getMemberId(), product.getProductId());

        if (existingCartItem.isPresent()) {
            // 이미 있다면 수량 증가
            CartItem cartItem = existingCartItem.get();
            cartItem.setCount(cartItem.getCount() + dto.getCount());
            cartItemRepository.save(cartItem);
        } else {
            // 없다면 새로 생성
            CartItem cartItem = new CartItem();
            cartItem.setMember(member);
            cartItem.setProduct(product);
            cartItem.setCount(dto.getCount());
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional(readOnly = true)
    public List<CartItemResponseDto> getCartItems(String loginId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        List<CartItem> cartItems = cartItemRepository.findByMember_MemberId(member.getMemberId());
        
        return cartItems.stream()
                .map(CartItemResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCartItem(String loginId, Long cartItemId) {
        Member member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다."));

        // 본인의 장바구니 항목인지 권한 체크
        if (!cartItem.getMember().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("해당 항목을 삭제할 권한이 없습니다.");
        }

        cartItemRepository.delete(cartItem);
    }
}
