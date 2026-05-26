package com.example.minsung.demo.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

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

                // 5. 스프링 시큐리티(서버의 보안 본부)에 "이 사람(email)은 인증된 사람이야!" 라고 등록해 둡니다.
                // 이렇게 해두면 뒤에 있는 컨트롤러나 서비스에서 이메일을 언제든 꺼내 쓸 수 있습니다.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, null);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // 토큰이 가짜거나 시간이 지났다면 그냥 쫓아냅니다(에러 로그만 남김).
                System.out.println("JWT 토큰이 유효하지 않습니다: " + e.getMessage());
            }
        }

        // 6. 보안 검사가 끝났으니, 다음 문(컨트롤러)으로 통과시킵니다.
        filterChain.doFilter(request, response);
    }
}