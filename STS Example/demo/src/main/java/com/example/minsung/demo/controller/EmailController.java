package com.example.minsung.demo.controller;

import com.example.minsung.demo.dto.emailDto.EmailSendRequestDto;
import com.example.minsung.demo.dto.emailDto.EmailVerifyRequestDto;
import com.example.minsung.demo.service.emailService.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/email") // 기본 공통 주소
public class EmailController {

    @Autowired
    private EmailService emailService;

    // 1. 인증번호 발송 창구 (POST)
    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody EmailSendRequestDto dto) {
        try {
            emailService.sendVerificationEmail(dto.getEmail());
            // 성공 딱지(200 OK) 부착
            return ResponseEntity.ok("입력하신 이메일로 인증번호가 발송되었습니다. (5분 제한)");
        } catch (Exception e) {
            // 에러 딱지(500 서버 에러) 부착
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("메일 발송 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 2. 인증번호 확인 창구 (POST)
    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestBody EmailVerifyRequestDto dto) {
        try {
            emailService.verifyCode(dto);
            // 모든 검증 통과 시 성공 딱지(200 OK) 부착
            return ResponseEntity.ok("이메일 인증이 성공적으로 완료되었습니다! 회원가입을 계속 진행해 주세요.");
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            // 🔥 핵심! 시간 만료나 번호 불일치 시, '잘못된 요청(400 Bad Request)' 딱지를 붙여서 보냅니다.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다.");
        }
    }
}