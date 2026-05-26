package com.example.minsung.demo.dto.emailDto;

public class EmailVerifyRequestDto {
    private String email;
    private String code; // 고객이 메일함에서 보고 입력한 6자리 코드

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}