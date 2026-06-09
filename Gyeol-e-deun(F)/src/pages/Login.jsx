import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api } from '../utils/api';
import '../css/auth.css';

function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginId || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await apiClient.post(api.members.login, { loginId, password });
      localStorage.setItem('accessToken', response.data);
      alert('결이든에 오신 것을 환영합니다! 🌿');
      navigate('/');
    } catch (error) {
      if (error.response?.data) {
        alert(`로그인 실패: ${error.response.data}`);
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
      console.error(error);
    }
  };

  return (
    <div className="signup-box">
      <h2>결이든 로그인 🌱</h2>
      <p className="subtitle">따뜻한 나눔의 공간으로 들어오세요.</p>

      <form onSubmit={handleLoginSubmit}>
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

        <div className="auth-link-row">
          아직 결이든 가족이 아니신가요?
          <button type="button" className="auth-link" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
