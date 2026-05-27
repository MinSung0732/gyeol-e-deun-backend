package com.example.minsung.demo.dto.memberDto;

public class MemberLoginRequestDto {
    private String loginId; // 💡 email 대신 loginId로 변경!
    private String email; // 이메일은 여전히 DB에서 중복 검증용으로 사용하지만, 로그인 시에는 loginId로 인증합니다.
    private String password;

    // Getter & Setter
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}