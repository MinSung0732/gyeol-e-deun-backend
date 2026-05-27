package com.example.minsung.demo.dto.memberDto;

public class MemberRegisterRequestDto {
    private String loginId; // 로그인 아이디 추가
    private String email; // 이메일은 고유해야 하므로 중복 검증 대상입니다.
    private String password; // 비밀번호는 암호화해서 저장할 예정이므로 평문으로 받아옵니다.
    private String name; // 회원의 이름
    private String birth; // 회원의 생년월일 (예: "1990-01-01" 형식)
    private String phone; // 회원의 전화번호
    private String zipcode; // 우편번호
    private String address; // 기본 주소
    private String detailAddress; // 상세 주소

    // --- 데이터 교환을 위한 Getter와 Setter들 ---
    
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBirth() { return birth; }
    public void setBirth(String birth) { this.birth = birth; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getZipcode() { return zipcode; }
    public void setZipcode(String zipcode) { this.zipcode = zipcode; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDetailAddress() { return detailAddress; }
    public void setDetailAddress(String detailAddress) { this.detailAddress = detailAddress; }
}