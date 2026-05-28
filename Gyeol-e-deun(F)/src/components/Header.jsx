import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css'; // 디자인 통일을 위해 가져오기
import axios from 'axios'; // 백엔드와 통신하기 위한 도구

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. 로그인 상태와 사용자 이름을 담을 바구니
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // 2. 컴포넌트가 켜질 때 주머니를 검사하고, 백엔드에 이름을 물어봅니다.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // 주머니에 토큰이 있다면 백엔드(/me)로 요청을 보냅니다.
      axios.get('http://localhost:8080/api/members/me', {
        headers: {
          // 💡 이것이 바로 웹의 약속! 신분증(토큰)을 보여줄 때는 'Bearer '를 앞에 붙입니다.
          Authorization: `Bearer ${token}` 
        }
      })
      .then((response) => {
        // 백엔드가 토큰을 인정하고 이름을 돌려준 경우!
        setIsLoggedIn(true);
        setUserName(response.data); // 백엔드가 보내준 진짜 이름(예: 민성)으로 세팅!
      })
      .catch((error) => {
        // 🚨 방금 설정한 '1시간'이 지났거나 토큰이 이상한 경우 여기서 잡힙니다.
        console.error('토큰 만료 또는 오류:', error);
        localStorage.removeItem('accessToken'); // 낡은 팔찌를 주머니에서 버립니다.
        setIsLoggedIn(false); // 로그인 전 상태로 되돌립니다.
      });
    } else {
      setIsLoggedIn(false); // 애초에 토큰이 없으면 로그인 전 상태
    }
  }, [location.pathname]); // 페이지가 바뀔 때마다 로그인 상태를 다시 확인합니다.

  // 3. 🏃‍♂️ 로그아웃 버튼을 눌렀을 때 실행될 함수
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // 주머니에서 팔찌를 버립니다.
    setIsLoggedIn(false);
    alert('로그아웃되었습니다. 또 방문해 주세요! 🍂');
    navigate('/'); // 메인 화면으로 이동
    window.location.reload(); // 상태 반영을 위해 화면을 한 번 새로고침 해줍니다.
  };

  return (
    <header className="main-header">
      {/* 쇼핑몰 로고 구역 (왼쪽) */}
      <div className="logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <h1>결이든 🌱</h1>
      </div>

      {/* 💡 대표님이 말씀하신 상단 우측 작은 메뉴 구역 */}
      <div className="top-nav-right">
        {isLoggedIn ? (
          /* 🔒 로그인 성공 시 보이는 화면 */
          <div className="user-menu-group">
            <span className="welcome-text">
              <strong>{userName}</strong>님 결이든에 오신 것을 환영합니다 🌿
            </span>
            <button className="btn-text-link" onClick={() => navigate('/mypage')}>마이페이지</button>
            <span className="divider">|</span>
            <button className="btn-text-link" onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          /* 🔓 로그인 전 보이는 화면 */
          <div className="guest-menu-group">
            <span className="welcome-text">결이든에 오신 것을 환영합니다 🌱</span>
            <button className="btn-text-link" onClick={() => navigate('/login')}>로그인</button>
            <span className="divider">|</span>
            <button className="btn-text-link" onClick={() => navigate('/signup')}>회원가입</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;