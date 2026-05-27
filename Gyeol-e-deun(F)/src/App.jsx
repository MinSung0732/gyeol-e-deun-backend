import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup'; // 회원가입 페이지 컴포넌트
import Login from './pages/Login'; // 로그인 페이지 컴포넌트
import './index.css';

function Home() {
  return (
    <div className="app-container">
      <h1>결이든에 오신 것을 환영합니다 🌿</h1>
      <p>자연의 편안함과 따뜻한 나눔이 머무는 곳입니다.</p>
      
      {/* 회원가입 페이지로 이동하는 예쁜 버튼 */}
      <Link to="/signup" className="link-button">
        함께하기 (회원가입)
      </Link>

      {/* 로그인 페이지로 이동하는 예쁜 버튼 */}
      <Link to="/login" className="link-button">
        로그인하기
      </Link>
    </div>
  );
}

function App() {
  return (
    // 💡 BrowserRouter: 리액트가 주소(URL)를 인식하게 해주는 든든한 울타리입니다.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;