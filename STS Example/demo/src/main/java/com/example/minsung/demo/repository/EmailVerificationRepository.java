package com.example.minsung.demo.repository;

import com.example.minsung.demo.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    
    // 💡 가장 최근에 해당 이메일로 발송된 인증 정보를 찾기 위한 메서드
    // JPA가 이를 분석해 "SELECT * FROM email_verification WHERE email = ? ORDER BY id DESC LIMIT 1" 의사 쿼리를 수행합니다.
    Optional<EmailVerification> findTopByEmailOrderByIdDesc(String email);
}