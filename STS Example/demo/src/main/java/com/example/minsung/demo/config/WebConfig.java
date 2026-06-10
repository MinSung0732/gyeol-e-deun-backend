package com.example.minsung.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 주소에 대해
                .allowedOrigins("http://localhost:5173") // 리액트(5173)의 접근을 허락해줘!
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프론트엔드가 "/uploads/사진.png" 라고 요청하면,
        registry.addResourceHandler("/uploads/**")
                // 서버 컴퓨터의 실제 "uploads/" 폴더 안에서 사진을 꺼내어 보여줍니다!
                .addResourceLocations("file:uploads/");
    }
}