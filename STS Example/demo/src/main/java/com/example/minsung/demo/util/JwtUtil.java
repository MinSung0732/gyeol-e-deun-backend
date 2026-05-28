package com.example.minsung.demo.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
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

    // 💡 토큰을 해독해서 그 안의 주체(Subject = 로그인 아이디)를 꺼내는 메서드
    public String getLoginIdFromToken(String token) {
        // 1. 토큰의 자물쇠를 열기 위해, 우리가 잠글 때 썼던 동일한 비밀키(key)를 사용합니다.
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key) 
                .build()
                .parseClaimsJws(token)
                .getBody();

        // 2. 내용물(Claims) 중에서 이름표(Subject)로 넣어둔 아이디를 꺼내서 반환합니다.
        return claims.getSubject();
    }

    public String createToken(String loginId, String role) {
        return Jwts.builder()
                .setSubject(loginId)
                .claim("role", role) // 🌿 이곳이 핵심! 토큰 안에 'ROLE_ADMIN'이라는 직인을 깊이 새겨 넣습니다.
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1시간
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 💡 2. 토큰에서 직인(권한)만 조심스레 꺼내보는 기능 추가
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }
}