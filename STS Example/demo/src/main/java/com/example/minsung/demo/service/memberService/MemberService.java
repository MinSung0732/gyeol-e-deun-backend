package com.example.minsung.demo.service.memberService;

import com.example.minsung.demo.dto.memberDto.MemberLoginRequestDto;
import com.example.minsung.demo.dto.memberDto.MemberRegisterRequestDto;
import com.example.minsung.demo.util.JwtUtil;
import com.example.minsung.demo.entity.Member;
import com.example.minsung.demo.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 암호화 도구 임포트
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder; // Config에서 등록한 암호화 기계 주입!

    @Autowired
    private JwtUtil jwtUtil;

    // 회원가입 핵심 비즈니스 로직
    public void register(MemberRegisterRequestDto dto) {
        
        // 1. [중복 검증] 혹시 이미 이 이메일로 가입한 사람이 있는지 창고에서 찾아봅니다.
        Optional<Member> alreadyMember = memberRepository.findByEmail(dto.getEmail());
        if (alreadyMember.isPresent()) {
            // 이미 존재한다면 예외를 발생시켜서 가입을 중단시킵니다.
            throw new IllegalStateException("이미 가입된 이메일 주소입니다.");
        }

        // 2. [알맹이 포장] 검증을 통과했다면 실제 DB에 넣을 빈 Member 객체를 만듭니다.
        Member member = new Member();
        member.setLoginId(dto.getLoginId());
        member.setEmail(dto.getEmail());
        member.setName(dto.getName());
        member.setBirth(dto.getBirth());
        member.setPhone(dto.getPhone());
        member.setZipcode(dto.getZipcode());
        member.setAddress(dto.getAddress());
        member.setDetailAddress(dto.getDetailAddress());
        member.setRole("ROLE_USER"); // 일반 고객 권한 부여

        // 3. 🔥 [핵심: 암호화] 프론트가 보낸 가짜 비밀번호를 암호화 기계에 넣고 돌려서 새 암호문을 뽑아냅니다.
        String encryptedPassword = passwordEncoder.encode(dto.getPassword());
        member.setPassword(encryptedPassword); // 영구히 복구 불가능한 암호문을 저장!

        // 4. 창고에 최종 저장
        memberRepository.save(member);
    }

    // 로그인 핵심 비즈니스 로직
   public String login(MemberLoginRequestDto dto) {
        // 1. 💡 이메일이 아닌 '아이디(loginId)'가 DB에 있는지 확인합니다.
        Member member = memberRepository.findByLoginId(dto.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        // 2. 비밀번호 확인
        if (!passwordEncoder.matches(dto.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 출입증(JWT) 발급 (토큰 안에는 보통 변하지 않는 고유 정보인 email이나 loginId를 넣습니다)
        return jwtUtil.generateToken(member.getLoginId(), member.getRole());
    }

    // 💡 컨트롤러의 요청을 받아 창고(Repository)에서 회원을 찾아다 주는 메서드
    public Member findByLoginId(String loginId) {
        return memberRepository.findByLoginId(loginId)
                // 만약 창고에 그 아이디가 없다면 에러를 던집니다.
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }
}