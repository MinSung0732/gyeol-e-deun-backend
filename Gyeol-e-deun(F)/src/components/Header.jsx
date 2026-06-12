import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import '../css/header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setIsLoggedIn(false);
      setUserName('');
      setIsAdmin(false);
      return;
    }

    apiClient.get(api.members.me, { headers: authHeaders(token) })
      .then((response) => {
        setIsLoggedIn(true);
        setUserName(response.data.name);
        setIsAdmin(response.data.role === 'ADMIN' || response.data.role === 'ROLE_ADMIN');
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false);
        setUserName('');
        setIsAdmin(false);
      });
  }, [location.pathname]);

  const goToAbout = () => {
    if (location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#about');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-inner">
        <div className="logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1>결이든 🌱</h1>
        </div>

        <nav className="header-nav">
          <button type="button" className="btn-text-link" onClick={goToAbout}>회사 소개</button>  
          <button type="button" className="btn-text-link" onClick={() => navigate('/products')}>상품</button>
          {isAdmin && (
            <button type="button" className="btn-text-link" onClick={() => navigate('/admin/dashboard')}>관리자 페이지</button>
          )}
        </nav>

        <div className="top-nav-right">
          {isLoggedIn ? (
            <div className="user-menu-group">
              <span className="welcome-text">
                <strong>{userName}</strong>님 결이든에 오신 것을 환영합니다 🌿
              </span>
              <button type="button" className="btn-text-link" onClick={() => navigate('/mypage')}>마이페이지</button>
              <span className="divider">|</span>
              <button type="button" className="btn-text-link" onClick={() => navigate('/cart')}>장바구니</button>
              <span className="divider">|</span>
              <button type="button" className="btn-text-link" onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <div className="guest-menu-group">
              <span className="welcome-text">결이든에 오신 것을 환영합니다 🌱</span>
              <button type="button" className="btn-text-link" onClick={() => navigate('/login')}>로그인</button>
              <span className="divider">|</span>
              <button type="button" className="btn-text-link" onClick={() => navigate('/signup')}>회원가입</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
