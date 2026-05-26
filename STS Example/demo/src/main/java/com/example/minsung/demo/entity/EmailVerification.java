package com.example.minsung.demo.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
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

    // --- Getter와 Setter (유지보수를 위해 직접 구현) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public LocalDateTime getExpirationTime() { return expirationTime; }
    public void setExpirationTime(LocalDateTime expirationTime) { this.expirationTime = expirationTime; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
}