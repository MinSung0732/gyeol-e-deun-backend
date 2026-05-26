package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.emailDto.EmailSendRequestDto;
import com.example.minsung.demo.dto.emailDto.EmailVerifyRequestDto;
import com.example.minsung.demo.service.emailService.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/email") // 기본 공통 주소
public class EmailController {

    @Autowired
    private EmailService emailService;

    // 1. 인증번호 발송 창구 (POST)
    @PostMapping("/send")
    public String sendEmail(@RequestBody EmailSendRequestDto dto) {
        try {
            emailService.sendVerificationEmail(dto.getEmail());
            return "입력하신 이메일로 인증번호가 발송되었습니다. (5분 제한)";
        } catch (Exception e) {
            return "메일 발송 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    // 2. 인증번호 확인 창구 (POST)
    @PostMapping("/verify")
    public String verifyEmail(@RequestBody EmailVerifyRequestDto dto) {
        try {
            emailService.verifyCode(dto);
            return "이메일 인증이 성공적으로 완료되었습니다! 회원가입을 계속 진행해 주세요.";
        } catch (Exception e) {
            // 시간 만료나 번호 불일치 시 서비스가 던진 에러 메시지를 그대로 프론트에 전달
            return e.getMessage();
        }
    }
}