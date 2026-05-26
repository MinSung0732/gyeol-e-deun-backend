package com.example.minsung.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // 💡 세션(서버 메모리)에 금붕어처럼 기억하지 말고, 매번 JWT로만 검사해라! (표준 설정)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 로그인, 회원가입, 상품 조회는 출입증 없이 아무나 볼 수 있게 열어둠
                .requestMatchers("/api/members/register", "/api/members/login", "/api/admin/products", "/api/auth/email/**").permitAll()
                // 장바구니 담기 등 그 외의 모든 요청은 반드시 출입증(JWT)이 있어야 통과!
                .anyRequest().authenticated()
            )
            // 💡 스프링의 기본 보안 문지기 앞에, 우리가 만든 JwtFilter(보안 요원)를 먼저 세워라!
            .addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}