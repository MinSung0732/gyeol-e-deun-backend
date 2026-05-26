package com.example.minsung.demo.service.emailService;

import com.example.minsung.demo.dto.emailDto.EmailVerifyRequestDto;
import com.example.minsung.demo.entity.EmailVerification;
import com.example.minsung.demo.repository.EmailVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender; // application.properties 설정을 물고 작동하는 메일 발송기

    @Autowired
    private EmailVerificationRepository verificationRepository;

    // 🔥 [요구사항 2번] 6자리 랜덤 영문+숫자 코드 생성기
    private String createRandomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 조합할 문자열 풀
        StringBuilder code = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < 6; i++) {
            // 문자열 풀에서 랜덤하게 글자를 하나씩 뽑아서 6번 더합니다.
            int index = random.nextInt(characters.length());
            code.append(characters.charAt(index));
        }
        return code.toString();
    }

    // 🟢 1단계: 인증 이메일 발송 및 DB 기록
    public void sendVerificationEmail(String email) {
        String code = createRandomCode(); // 6자리 코드 생성

        // 💡 [요구사항 3번] 만료 시간을 '현재 시간 + 5분'으로 설정합니다.
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(5);

        // DB에 임시 저장할 데이터 세팅
        EmailVerification verification = new EmailVerification();
        verification.setEmail(email);
        verification.setCode(code);
        verification.setExpirationTime(expirationTime);
        
        verificationRepository.save(verification); // 창고에 5분 타이머 기록 저장!

        // 실제 구글 서버를 통해 고객에게 메일 발송
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email); // 받는 사람
        message.setSubject("[결이든] 회원가입 이메일 인증번호입니다."); // 제목
        message.setText("안녕하세요. 결이든 쇼핑몰입니다.\n\n인증번호 6자리를 입력해 주세요.\n인증번호: " + code + "\n\n(5분 이내에 입력하셔야 합니다.)"); // 내용
        
        mailSender.send(message); // 냅다 쏘기!
    }

    // 🟢 2단계: [요구사항 3번] 고객이 입력한 코드 검증 (5분 기한 체크)
    public boolean verifyCode(EmailVerifyRequestDto dto) {
        // 1. 해당 이메일로 보낸 가장 최근 인증 정보를 DB에서 가져옵니다.
        EmailVerification verification = verificationRepository.findTopByEmailOrderByIdDesc(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("인증 요청 내역이 존재하지 않습니다."));

        // 2. 만료 시간과 현재 시간을 비교합니다. (현재 시간이 만료 시간보다 뒤에 있다면? 시간 초과!)
        if (LocalDateTime.now().isAfter(verification.getExpirationTime())) {
            throw new IllegalStateException("인증 시간이 만료되었습니다. 다시 요청해 주세요.");
        }

        // 3. 고객이 입력한 번호와 DB에 저장된 번호가 일치하는지 비교합니다.
        if (!verification.getCode().equals(dto.getCode())) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");
        }

        // 4. 모든 검증을 통과했다면 인증 성공 처리!
        verification.setVerified(true);
        verificationRepository.save(verification); // 성공 상태를 DB에 업데이트
        
        return true;
    }
}