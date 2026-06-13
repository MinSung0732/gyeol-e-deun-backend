package com.example.minsung.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int price;

    @Column
    private Integer originalPrice;

    @Column
    private Integer discountPercent;

    @Column(nullable = false)
    private int stock;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(length = 500)
    private String thumbnailUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_thumbnail", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "image_url", length = 500)
    private List<String> thumbnailUrls = new ArrayList<>();
    @Column(length = 500)
    private String detailImageUrl; // 상세 설명용 통이미지
    @Column(length = 100)
    private String category; // 카테고리 정보

    // 상품 상태 (예: "ON_SALE"(판매중), "SOLD_OUT"(품절), "HIDDEN"(숨김))
    @Column(nullable = false)
    private String status; 

    @CreationTimestamp // 상품 최초 등록일
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // 상품 정보 마지막 수정일 (가격 바꿀 때 기록용)
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    // Getter & Setter (생략)
}
