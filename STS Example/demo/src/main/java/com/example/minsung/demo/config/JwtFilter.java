package com.example.minsung.demo.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority; // 💡 추가됨
import org.springframework.security.core.authority.SimpleGrantedAuthority; // 💡 추가됨
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections; // 💡 추가됨
import java.util.List; // 💡 추가됨

// 모든 요청이 컨트롤러에 도착하기 전에 딱 한 번(Once) 거쳐가는 필터입니다.
public class JwtFilter extends OncePerRequestFilter {

    private final String SECRET_KEY = "GyeolEDeunShoppingMallSecretKeyForJwtTokenGeneration";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 프론트엔드가 보낸 요청의 'Header(머리말)' 부분에서 "Authorization"이라는 이름표를 찾습니다.
        String authorizationHeader = request.getHeader("Authorization");

        // 2. 만약 이름표가 있고, 그 내용이 "Bearer "로 시작한다면 (JWT의 표준 규칙입니다)
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            
            // "Bearer " 글자(7글자)를 떼어내고 순수 토큰만 남깁니다.
            String token = authorizationHeader.substring(7);

            try {
                // 3. 비밀 도장(SECRET_KEY)을 꺼내서 이 토큰이 진짜인지 긁어봅니다.
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(SECRET_KEY.getBytes())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                // 4. 진짜 출입증이라면, 토큰에 적힌 이메일을 꺼냅니다.
                String email = claims.getSubject();

                // 💡 [수정된 부분 1] 토큰 안에서 "role"이라는 이름표(직인)를 꺼냅니다.
                String role = claims.get("role", String.class);

                // 💡 [수정된 부분 2] 직인이 있다면, 스프링 시큐리티가 이해하는 '정식 배지'로 만들어줍니다.
                // 만약 구형 토큰이라 role이 없다면 일반 사용자 배지(ROLE_USER)를 줍니다.
                List<GrantedAuthority> authorities;
                if (role != null) {
                    authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
                } else {
                    authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
                }

                // 💡 [수정된 부분 3] 세 번째 칸에 null 대신, 방금 만든 배지(authorities)를 달아줍니다!
                // 5. 스프링 시큐리티(서버의 보안 본부)에 "이 사람(email)은 이 권한(authorities)을 가졌어!" 라고 등록해 둡니다.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                        
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                // 토큰이 시간이 지났다면, "토큰이 만료되었습니다"라고 로그를 남깁니다.
                System.out.println("JWT 토큰이 만료되었습니다: " + e.getMessage()); 
            } catch (Exception e) {
                // 토큰이 가짜거나 시간이 지났다면 그냥 쫓아냅니다(에러 로그만 남김).
                System.out.println("JWT 토큰이 유효하지 않습니다: " + e.getMessage());
            }
        }

        // 6. 보안 검사가 끝났으니, 다음 문(컨트롤러)으로 통과시킵니다.
        filterChain.doFilter(request, response);
    }
}