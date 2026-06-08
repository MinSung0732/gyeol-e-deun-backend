package com.example.minsung.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
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
            // 💡 1. "보안 요원아! WebConfig에서 설정한 CORS 규칙을 너도 똑같이 적용해라!"
            .cors(Customizer.withDefaults()) 
            
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 💡 2. "사전 질문(OPTIONS)은 토큰이 없어도 무조건 통과시켜 줘!"
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                // (기존에 열어두신 주소들)
                .requestMatchers("/uploads/**","/api/members/register", "/api/members/login", "/api/admin/products", "/api/products/**", "/api/auth/email/**").permitAll()
                // 💡 핵심 추가: "/api/admin/..." 으로 시작하는 모든 주소는 관리자(ROLE_ADMIN)만 출입 가능!
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                // 장바구니 담기 등 그 외의 모든 요청은 반드시 출입증(JWT)이 있어야 통과!
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}