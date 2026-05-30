package com.example.minsung.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "email_verification") // DB에 생성될 테이블 이름
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email; // 인증을 시도하는 이메일 주소

    @Column(nullable = false, length = 6)
    private String code; // 생성된 6자리 랜덤 인증코드 (영문+숫자)

    @Column(nullable = false)
    private LocalDateTime expirationTime; // 👈 핵심: 5분 뒤 만료될 시간

    @Column(nullable = false)
    private boolean isVerified = false; // 👈 추가: 인증 성공 여부 (기본값 false)
    
}