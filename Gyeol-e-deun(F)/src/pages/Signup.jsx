import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode'; // 🏡 주소 API 가져오기
import '../css/index.css'; // 디자인 통일을 위해 가져오기
import '../css/auth.css';
import BoxedLayout from '../components/layout/BoxedLayout';

function Signup() {
  // --- [상태 정의: 바구니들] ---
  const [loginId, setLoginId] = useState('');
  const [idChecked, setIdChecked] = useState(false); // 아이디 중복확인 여부
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // 이메일 분할 입력 상태
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('naver.com');
  const [customDomain, setCustomDomain] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false); // 인증번호 발송 여부
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부
  const [timeLeft, setTimeLeft] = useState(300); // 300초 = 5분
  const [isTimerActive, setIsTimerActive] = useState(false); // 타이머 작동 여부

  // 주소 상태
  const [zonecode, setZonecode] = useState(''); // 우편번호
  const [address, setAddress] = useState(''); // 기본주소
  const [detailAddress, setDetailAddress] = useState(''); // 상세주소
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false); // 주소 창 열림 여부

  // --- [기능 정의: 백엔드 연동 및 로직] ---

  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      alert('인증 시간이 만료되었습니다. 인증번호를 다시 발송해주세요. 🍂');
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  // 📱 휴대폰 번호 자동 하이픈(-) 입력 함수
  const handlePhoneChange = (e) => {
    // 1. 사용자가 입력한 값에서 숫자만 쏙 골라냅니다. (문자나 기존 하이픈 무시)
    const rawValue = e.target.value.replace(/[^0-9]/g, '');

    let formattedValue = '';

    // 2. 글자 수에 맞춰 예쁘게 하이픈을 끼워 넣습니다.
    if (rawValue.length < 4) {
      // 3자리 이하일 때는 그대로 (예: 010)
      formattedValue = rawValue;
    } else if (rawValue.length < 8) {
      // 4~7자리일 때는 중간에 하이픈 하나 (예: 010-1234)
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else {
      // 8자리 이상일 때는 하이픈 두 개 (예: 010-1234-5678)
      // 최대 11자리 숫자까지만 잘라서 씁니다.
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    }

    // 3. 예쁘게 포장된 번호를 phoneNumber 바구니에 담습니다.
    setPhoneNumber(formattedValue);
  };

  // 🎂 생년월일 자동 하이픈(-) 입력 함수
  const handleBirthChange = (e) => {
    // 1. 숫자만 쏙 골라냅니다.
    const rawValue = e.target.value.replace(/[^0-9]/g, '');

    let formattedValue = '';

    // 2. 글자 수에 맞춰 4자리(연)-2자리(월)-2자리(일)로 하이픈을 끼워 넣습니다.
    if (rawValue.length < 5) {
      // 4자리 이하일 때는 그대로 (예: 1995)
      formattedValue = rawValue;
    } else if (rawValue.length < 7) {
      // 5~6자리일 때는 연도 뒤에 하이픈 하나 (예: 1995-05)
      formattedValue = `${rawValue.slice(0, 4)}-${rawValue.slice(4)}`;
    } else {
      // 7자리 이상일 때는 연, 월 뒤에 하이픈 두 개 (예: 1995-05-27)
      // 최대 8자리 숫자까지만 잘라서 씁니다.
      formattedValue = `${rawValue.slice(0, 4)}-${rawValue.slice(4, 6)}-${rawValue.slice(6, 8)}`;
    }

    // 3. 예쁘게 포장된 생년월일을 birth 바구니에 담습니다.
    setBirth(formattedValue);
  };

  // 초(sec)를 "05:00" 형태의 예쁜 문자로 바꿔주는 함수
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. 완성된 이메일 주소 반환 함수
  const getFullEmail = () => {
    const domain = emailDomain === 'custom' ? customDomain : emailDomain;
    return `${emailId}@${domain}`;
  };

  // 2. 아이디 중복 확인 
  const handleCheckId = async () => {
    // 💡 정규식: a~z, A~Z, 0~9 글자만 허용하고 길이는 4~12자여야 한다는 규칙입니다.
    const idRegex = /^[a-zA-Z0-9]{4,12}$/;
    
    if (!idRegex.test(loginId)) {
      alert('아이디는 영문과 숫자를 조합하여 4자 이상 12자 이하로 입력해주세요. 🌿');
      return; // 여기서 함수를 멈추고 서버로 보내지 않습니다!
    }

    try {
      // (기존 백엔드 중복 확인 Axios 코드)
      // await axios.get(...)
      alert('사용 가능한 아이디입니다! 🌱');
      setIdChecked(true);
    } catch (error) {
      alert('이미 존재하는 아이디입니다.');
    }
  };
  

  // 3. 어제 만든 이메일 인증번호 발송 연동
  const handleSendEmail = async () => {
    const fullEmail = getFullEmail();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailId || (emailDomain === 'custom' && !customDomain)) {
      alert('이메일 주소를 올바르게 입력해주세요.');
      return;
    }
    if (!emailRegex.test(fullEmail)) {
      alert('이메일 주소를 올바르게 입력해주세요.');
      return;
    }
    try {
      // 🚚 어제 테스트했던 백엔드 이메일 발송 주소로 post 요청
      await axios.post('http://localhost:8080/api/auth/email/send', { email: fullEmail });
      alert('인증번호가 발송되었습니다. 메일함을 확인해주세요! 📩');
      setIsEmailSent(true);
      setIsTimerActive(true); // 타이머 시작
      setTimeLeft(300); // 5분으로 초기화
    } catch (error) {
      alert('인증번호 발송에 실패했습니다. 이메일을 다시 확인해주세요.');
      console.error(error);
    }
  };

  // 4. 이메일 인증번호 확인 연동
  const handleVerifyEmail = async () => {
    const fullEmail = getFullEmail();
    
    if (timeLeft <= 0) {
      alert('인증 시간이 만료되었습니다.');
      return;
    }

    try {
      // 💡 주석을 풀고 백엔드(8080)로 사용자가 입력한 코드를 진짜로 보냅니다!
      await axios.post('http://localhost:8080/api/auth/email/verify', { 
        email: fullEmail, 
        code: verificationCode 
      });
      
      // 백엔드에서 200 OK(성공) 대답이 왔을 때만 아래가 실행됩니다.
      alert('이메일 인증이 완료되었습니다! ✅');
      setIsEmailVerified(true);
      
    } catch (error) {
      // 🚨 백엔드에서 코드가 틀렸다고 에러를 보냈을 때 실행됩니다.
      if (error.response && error.response.data) {
        alert(`인증 실패: ${error.response.data}`);
      } else {
        alert('인증번호가 일치하지 않거나 만료되었습니다. 🍂');
      }
      setIsEmailVerified(false); // 인증 실패 처리
    }
  };

  // 5. 카카오 주소 선택 완료 시 실행되는 함수
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setZonecode(data.zonecode);
    setAddress(fullAddress);
    setIsPostcodeOpen(false); // 주소창 닫기
  };

    // 6. 최종 가입하기 버튼 클릭
    const handleSignupSubmit = async () => {
      // (1) 아이디 조건 검사 (가입 버튼 누를 때도 한 번 더 꼼꼼하게 체크!)
      const idRegex = /^[a-zA-Z0-9]{4,12}$/;
      if (!idRegex.test(loginId)) {
        alert('아이디는 영문과 숫자를 조합하여 4자 이상 12자 이하로 입력해주세요.');
        return;
      }

      // (2) 💡 비밀번호 길이 조건 검사 (8자 ~ 20자)
      if (password.length < 8 || password.length > 20) {
        alert('비밀번호는 8자 이상 20자 이하로 입력해주세요. 🌿');
        return;
      }

      // (3) 비밀번호 일치 검사
      if (password !== passwordConfirm) {
        alert('비밀번호가 서로 일치하지 않습니다.');
        return;
      }

      // (4) 이메일 인증 여부 검사 (옵션: 인증 안 하면 못 넘어가게 막기)
      if (!isEmailVerified) {
        alert('이메일 인증을 먼저 완료해주세요.');
        return;
      }

      // (5) 아이디 중복 확인 여부 검사
      if (!idChecked) {
        alert('아이디 중복확인을 해주세요.');
        return;
      }

      // (6) 패스워드 공백 검사 (공백만 입력하는 경우도 막기)
      if (password.trim() === '') {
        alert('비밀번호를 입력해주세요.');
        return;
      }

      // (7) 전화번호 형식 검사 (010-0000-0000)
      const phoneRegex = /^010-\d{4}-\d{4}$/; 
      if (!phoneRegex.test(phoneNumber)) {
        alert('전화번호를 올바르게 입력해주세요. (예: 010-0000-0000)');
        return;
      }

      // (8) 🎂 생년월일 형식 검사 (새로 추가!)
      // \d{4}는 숫자 4개, \d{2}는 숫자 2개를 의미합니다.
      const birthRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthRegex.test(birth)) {
        alert('생년월일 8자리를 끝까지 올바르게 입력해주세요. (예: 1995-05-27)');
        return; // 형식이 안 맞으면 여기서 가입 중단!
      }

    try {
      const fullEmail = getFullEmail();
      
      // 🚚 백엔드가 기다리는 정확한 이름표로 데이터를 예쁘게 포장합니다.
      await axios.post('http://localhost:8080/api/members/register', {
        loginId: loginId,
        password: password,
        name: name,
        birth: birth,
        email: fullEmail,
        phone: phoneNumber,         // 백엔드 이름표(phone)에 맞춤
        zipcode: zonecode,          // 백엔드 이름표(zipcode)에 맞춤
        address: address,           // 기본 주소
        detailAddress: detailAddress // 상세 주소를 따로 분리해서 챙겨보냄!
      });

      alert('결이든 가족이 되신 것을 진심으로 환영합니다! 🎉');
      navigate('/');

    } catch (error) {
      // 1. 주방(백엔드)에서 명확한 거절 사유(데이터)를 적어 보낸 경우
      if (error.response && error.response.data) {
        
        // 백엔드가 문장 자체를 보냈을 수도 있고, JSON 형태로 보냈을 수도 있으니 유연하게 꺼냅니다.
        // (백엔드 설계에 따라 error.response.data.message 일 수도 있습니다)
        const errorMessage = error.response.data.message || error.response.data || '알 수 없는 이유로 가입에 실패했습니다.';
        
        alert(`가입 실패: ${errorMessage}`);
      } 
      // 2. 아예 주방(백엔드 서버) 문이 닫혀서 대답조차 없는 경우
      else {
        alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요. 🍂');
      }
      
      console.error('상세 에러 기록:', error);
    }
  };

  return (
    <BoxedLayout className="auth-page">
      <div className="signup-box">
        <h2>마음을 나누는 첫걸음 싹틔우기 🌱</h2>
        <p className="subtitle">결이든과 함께 따뜻한 여정을 시작해 주세요.</p>
        
        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          
          {/* 아이디 영역 */}
          <div className="input-group">
            <label>아이디</label>
            <div className="row-layout">
              <input type="text" placeholder="아이디 입력" value={loginId} onChange={(e) => {setLoginId(e.target.value);setIdChecked(false);}} />
              <button type="button" className="btn-outline" onClick={handleCheckId}>중복 확인</button>
            </div>
          </div>

          {/* 비밀번호 영역 */}
          <div className="input-group">
            <label>비밀번호</label>
            <input type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {/* 비밀번호 확인 영역 */}
          <div className="input-group">
            <label>비밀번호 확인</label>
            <input type="password" placeholder="비밀번호 다시 입력" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            {password && passwordConfirm && (
              <span className={`password-hint ${password === passwordConfirm ? 'match' : 'no-match'}`}>
                {password === passwordConfirm ? '✓ 비밀번호가 일치합니다.' : '✗ 비밀번호가 일치하지 않습니다.'}
              </span>
            )}
          </div>

          {/* 이름 영역 */}
          <div className="input-group">
            <label>이름</label>
            <input type="text" placeholder="성함 입력" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* 🎂 생년월일 영역 (새로 추가) */}
          <div className="input-group">
            <label>생년월일</label>
            <input 
              type="text" 
              placeholder="예: 1995-05-27" 
              value={birth} 
              onChange={handleBirthChange} /* 💡 새로 만든 변환기 연결! */
              maxLength={10} /* 💡 YYYY-MM-DD 형식은 총 10글자입니다. */
            />
          </div>

          {/* 이메일 & 인증 영역 */}
         <div className="input-group">
            <label>이메일 주소</label>
            
            {/* 새로운 감싸는 컨테이너 */}
            <div className="email-input-area">
              
              {/* 첫 번째 줄: 아이디 + @ + 드롭다운 */}
              <div className="email-main-row">
                <input 
                  type="text" 
                  placeholder="이메일" 
                  value={emailId} 
                  onChange={(e) => {
                  setEmailId(e.target.value);
                  setIsEmailVerified(false);
                }} 
                />
                <span className="at-sign">@</span>
                <select value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)}>
                  <option value="naver.com">naver.com</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="kakao.com">kakao.com</option>
                  <option value="hanmail.com">hanmail.com</option>
                  <option value="custom">직접입력</option>
                </select>
              </div>

              {/* 두 번째 줄: 직접 입력칸 (직접입력 선택시에만 예쁘게 등장) */}
              {emailDomain === 'custom' && (
                <input 
                  type="text" 
                  className="custom-domain-input fade-in" // fade-in 애니메이션 유지
                  placeholder="도메인 직접 입력 (예: gyeol.com)" 
                  value={customDomain} 
                  onChange={(e) => setCustomDomain(e.target.value)} 
                />
              )}
            </div>

  <button type="button" className="btn-outline-full" onClick={handleSendEmail}>
    {isEmailSent ? '인증번호 재발송' : '이메일 인증번호 발송'}
  </button>
</div>

          {/* 인증번호 입력란 (발송되었을 때만 노출) */}
          {isEmailSent && (
            <div className="input-group fade-in">
              <label>인증번호 입력</label>
              <div className="row-layout">
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="text" 
                    placeholder="인증번호 6자리" 
                    value={verificationCode} 
                    onChange={(e) => setVerificationCode(e.target.value)} 
                    disabled={isEmailVerified}
                    style={{ width: '100%' }}
                  />
                  {/* 입력칸 우측에 빨간색 타이머 표시 */}
                  {!isEmailVerified && (
                    <span style={{ position: 'absolute', right: '15px', top: '14px', color: '#D9534F', fontWeight: 'bold' }}>
                      {formatTime(timeLeft)}
                    </span>
                  )}
                </div>
                <button type="button" className="btn-outline" onClick={handleVerifyEmail} disabled={isEmailVerified}>
                  {isEmailVerified ? '인증 완료' : '인증 확인'}
                </button>
              </div>
            </div>
          )}

          {/* 핸드폰 번호 영역 */}
          <div className="input-group">
            <label>휴대폰 번호</label>
            <input 
              type="tel" 
              placeholder="010-0000-0000" 
              value={phoneNumber} 
              onChange={handlePhoneChange} /* 💡 방금 만든 변환기를 연결합니다! */
              maxLength={13} /* 💡 010-0000-0000은 하이픈 포함 최대 13글자입니다. */
            />
          </div>

          {/* 주소 입력 영역 */}
          <div className="input-group">
            <label>주소</label>
            <div className="row-layout">
              <input type="text" placeholder="우편번호" value={zonecode} readOnly />
              <button type="button" className="btn-outline" onClick={() => setIsPostcodeOpen(!isPostcodeOpen)}>주소 검색</button>
            </div>
            
            {/* 카카오 주소창 열기 */}
            {isPostcodeOpen && (
              <div className="postcode-box">
                <DaumPostcode onComplete={handleCompletePostcode} />
              </div>
            )}

            <input type="text" placeholder="기본 주소" value={address} readOnly style={{ marginTop: '8px' }} />
            <input type="text" placeholder="상세 주소 입력" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} style={{ marginTop: '8px' }} />
          </div>

          {/* 최종 가입하기 버튼 */}
          <button type="button" className="btn-submit" onClick={handleSignupSubmit}>
            결이든 가입하기 🌱
          </button>
        </form>
      </div>
    </BoxedLayout>
  );
}

export default Signup;