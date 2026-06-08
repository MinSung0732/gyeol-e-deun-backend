package com.example.minsung.demo.dto.memberDto;

public class MemberMeResponseDto {
    private String name;
    private String loginId;
    private String role;

    public MemberMeResponseDto(String name, String loginId, String role) {
        this.name = name;
        this.loginId = loginId;
        this.role = role;
    }

    public String getName() { return name; }
    public String getLoginId() { return loginId; }
    public String getRole() { return role; }
}
