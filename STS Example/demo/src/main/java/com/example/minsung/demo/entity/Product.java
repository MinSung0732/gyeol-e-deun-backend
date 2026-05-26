package com.example.minsung.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

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

    @Column(nullable = false)
    private int stock;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // 이미지 파일이 저장된 서버나 클라우드(S3) 경로
    @Column(length = 500)
    private String thumbnailUrl; // 목록에 보여질 썸네일
    @Column(length = 500)
    private String detailImageUrl; // 상세 설명용 통이미지

    // 상품 상태 (예: "ON_SALE"(판매중), "SOLD_OUT"(품절), "HIDDEN"(숨김))
    @Column(nullable = false)
    private String status; 

    @CreationTimestamp // 상품 최초 등록일
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // 상품 정보 마지막 수정일 (가격 바꿀 때 기록용)
    private LocalDateTime updatedAt;

    // Getter & Setter (생략)
}