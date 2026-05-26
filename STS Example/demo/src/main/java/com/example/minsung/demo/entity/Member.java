package com.example.minsung.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Data
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId; // 회원 고유 ID (자동 생성)

    @Column(nullable = false, unique = true)
    private String email; // 로그인 ID로 사용할 이메일 주소

    @Column(nullable = false)
    private String password; // 실제 서비스에서는 해시된 비밀번호를 저장해야 합니다.

    @Column(nullable = false, length = 50)
    private String name; // 회원 이름

    @Column(nullable = false, length = 20)
    private String phone; // 배송 연락처 (예: 010-1234-5678)

    // 배송을 위한 주소 3종 세트
    @Column(nullable = false)
    private String zipcode;      // 우편번호
    @Column(nullable = false)
    private String address;      // 도로명/지번 주소
    @Column(nullable = false)
    private String detailAddress;// 상세 주소 (동, 호수)

    @Column(nullable = false)
    private String role; // "ROLE_USER", "ROLE_ADMIN"

    @CreationTimestamp // 데이터가 INSERT 될 때 자동으로 현재 시간 저장 (가입일)
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Getter & Setter (이하 생략 - VS Code에서 자동 생성하시거나 롬복 @Data 쓰시면 됩니다)
}