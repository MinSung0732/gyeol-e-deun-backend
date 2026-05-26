package com.example.minsung.demo.controller;


import com.example.minsung.demo.dto.memberDto.MemberLoginRequestDto;
import com.example.minsung.demo.dto.memberDto.MemberRegisterRequestDto;
import com.example.minsung.demo.service.memberService.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members") // 기본 주소 경로 설정
public class MemberController {

    @Autowired
    private MemberService memberService;

    // 회원가입 요청 접수 (POST)
    @PostMapping("/register")
    public String registerMember(@RequestBody MemberRegisterRequestDto dto) {
        // 서비스에게 회원가입 처리하라고 명령
        memberService.register(dto);
        
        return "회원가입이 성공적으로 완료되었습니다!";
    }

    // 로그인 요청 접수 (POST)
    @PostMapping("/login")
    public String loginMember(@RequestBody MemberLoginRequestDto dto) {
        try {
            // 서비스에게 로그인을 시키고, 성공하면 발급된 JWT 토큰을 받습니다.
            String token = memberService.login(dto);
            // 프론트엔드에게 토큰을 전달합니다!
            return token; 
        } catch (IllegalArgumentException e) {
            // 이메일이나 비번이 틀렸을 경우 에러 메시지 리턴
            return e.getMessage();
        }
    }
}