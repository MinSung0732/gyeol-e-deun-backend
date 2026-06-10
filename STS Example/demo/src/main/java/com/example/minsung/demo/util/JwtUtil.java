package com.example.minsung.demo.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Locale;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "GyeolEDeunShoppingMallSecretKeyForJwtTokenGeneration";
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    private final long expireTime = 1000 * 60 * 60;

    public String generateToken(String loginId, String role) {
        return Jwts.builder()
                .setSubject(loginId)
                .claim("role", normalizeRole(role))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expireTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "ROLE_USER";
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if (normalized.startsWith("ROLE-")) {
            normalized = normalized.replace("ROLE-", "ROLE_");
        }
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        return normalized;
    }

    public String getLoginIdFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
