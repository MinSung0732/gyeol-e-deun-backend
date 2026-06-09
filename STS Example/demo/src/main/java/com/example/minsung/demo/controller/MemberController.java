package com.example.minsung.demo.controller;


import com.example.minsung.demo.dto.memberDto.MemberLoginRequestDto;
import com.example.minsung.demo.dto.memberDto.MemberMeResponseDto;
import com.example.minsung.demo.dto.memberDto.MemberRegisterRequestDto;
import com.example.minsung.demo.entity.Member;
import com.example.minsung.demo.service.memberService.MemberService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members") // 기본 주소 경로 설정
public class MemberController {

    @Autowired
    private MemberService memberService;

    // 회원가입 요청 접수 (POST)
    @PostMapping("/register")
    public ResponseEntity<?> registerMember(@RequestBody MemberRegisterRequestDto dto) {
        try {
            // 1. 주방장(Service)에게 요리를 지시합니다.
            memberService.register(dto);
            
            // 2. 무사히 끝나면 프론트엔드에 성공 대답(200 OK)을 보냅니다.
            return ResponseEntity.ok("회원가입이 완료되었습니다."); 
            
        } catch (IllegalStateException e) {
            // 🚨 3. 주방장이 "이미 가입된 이메일입니다!" 라고 예외(Error)를 던지면 여기서 잡습니다.
            // 그리고 프론트엔드에게 400(잘못된 요청) 코드와 함께 메시지를 텍스트 그대로 보냅니다!
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            
        } catch (Exception e) {
            // 4. 예상치 못한 다른 에러가 났을 때의 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다.");
        }
    }

    // 로그인 요청 접수 (POST)
    @PostMapping("/login")
    public ResponseEntity<?> loginMember(@RequestBody MemberLoginRequestDto dto) {
        try {
            // 1. 주방장(Service)에게 로그인을 지시하고, 성공하면 팔찌(JWT 토큰)를 받습니다.
            String token = memberService.login(dto);
            
            // 2. 성공 시 200 OK 딱지와 함께 토큰을 프론트로 보냅니다.
            return ResponseEntity.ok(token);
            
        } catch (IllegalArgumentException e) {
            // 🚨 3. 핵심! 아이디가 없거나 비밀번호가 틀렸을 때 주방장이 던진 에러를 낚아채서,
            // '401 Unauthorized (인증 실패)' 에러 딱지를 꽉 붙여서 프론트로 던집니다!
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
            
        } catch (Exception e) {
            // 4. 그 외 알 수 없는 서버 내부 에러 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }

    // 💡 [내 정보 가져오기] SecurityContextHolder를 사용하여 현재 로그인된 유저 정보를 반환합니다.
    @GetMapping("/me")
    public ResponseEntity<?> getMyName() {
        try {
            // 1. SecurityContextHolder에서 현재 인증된 사용자의 정보를 가져옵니다.
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자입니다.");
            }

            // 2. 인증 객체에서 로그인 아이디(username)를 꺼냅니다. (JwtFilter에서 설정한 값)
            String loginId = authentication.getName(); 
            
            // 3. 창고에서 그 아이디를 가진 회원을 찾습니다.
            Member member = memberService.findByLoginId(loginId);
            
            if (member == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원 정보를 찾을 수 없습니다.");
            }
            
            return ResponseEntity.ok(new MemberMeResponseDto(
                member.getName(),
                member.getLoginId(),
                member.getRole()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("사용자 정보를 가져오는 중 오류가 발생했습니다.");
        }
    }
}