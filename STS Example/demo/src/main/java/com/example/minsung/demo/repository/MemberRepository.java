package com.example.minsung.demo.repository;

import com.example.minsung.demo.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    // 💡 회원가입 시 중복 가입을 막거나, 로그인할 때 이메일로 회원을 찾기 위한 맞춤형 메서드입니다.
    // JPA가 메서드 이름을 보고 "SELECT * FROM member WHERE email = ?" 쿼리를 자동으로 짜줍니다.
    Optional<Member> findByEmail(String email);
}