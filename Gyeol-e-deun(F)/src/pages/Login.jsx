import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/index.css'; // 디자인 통일을 위해 가져오기
import '../css/auth.css';
import BoxedLayout from '../components/layout/BoxedLayout';

function Login() {
  const navigate = useNavigate();

  // 1. 💡 email 대신 loginId 바구니 사용
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 

    if (!loginId || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // 2. 💡 백엔드로 loginId와 password를 보냅니다.
      const response = await axios.post('http://localhost:8080/api/members/login', {
        loginId: loginId,
        password: password
      });

      // 3. 발급받은 JWT 토큰을 주머니에 챙깁니다.
      const jwtToken = response.data; 
      localStorage.setItem('accessToken', jwtToken); 

      alert('결이든에 오신 것을 환영합니다! 🌿');
      navigate('/'); 
      
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`로그인 실패: ${error.response.data}`);
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
      console.error(error);
    }
  };

  return (
    <BoxedLayout className="layout-boxed-page--centered">
      <div className="signup-box">
        <h2>결이든 로그인 🌱</h2>
        <p className="subtitle">따뜻한 나눔의 공간으로 들어오세요.</p>
        
        <form className="signup-form" onSubmit={handleLoginSubmit}>
          
          {/* 💡 입력칸을 아이디로 변경 */}
          <div className="input-group">
            <label>아이디</label>
            <input 
              type="text" 
              placeholder="아이디를 입력해주세요" 
              value={loginId} 
              onChange={(e) => setLoginId(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              placeholder="비밀번호를 입력해주세요" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button type="submit" className="btn-submit" style={{ marginTop: '20px' }}>
            로그인하기
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#7A8B7D' }}>
            아직 결이든 가족이 아니신가요? 
            <span 
              style={{ fontWeight: 'bold', marginLeft: '5px', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/signup')}
            >
              회원가입
            </span>
          </div>

        </form>
      </div>
    </BoxedLayout>
  );
}

export default Login;