package com.example.minsung.demo.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // 💡 서버만 알고 있는 강력한 비밀 도장(Secret Key)입니다. 
    // 실제 운영할 땐 절대 코드에 적지 않고 환경변수로 숨깁니다! (지금은 테스트용)
    private final String SECRET_KEY = "GyeolEDeunShoppingMallSecretKeyForJwtTokenGeneration";
    
    // 키를 암호화 알고리즘에 맞게 변환
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    
    // 출입증 유효기간 (밀리초 단위: 1000ms = 1초 / 현재 1시간으로 설정)
    private final long EXPIRE_TIME = 1000 * 60 * 60;

    // 💡 실제 JWT 토큰을 만들어내는 메서드
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email) // 토큰의 주인 (이메일)
                .claim("role", role) // 추가 정보 (권한)
                .setIssuedAt(new Date()) // 발급 시간
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME)) // 만료 시간
                .signWith(key, SignatureAlgorithm.HS256) // 비밀 도장 쾅!
                .compact(); // 토큰을 문자열로 압축!
    }
}