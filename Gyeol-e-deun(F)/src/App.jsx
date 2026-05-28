import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header'; // 헤더 컴포넌트 (로그인 상태에 따라 다르게 보이는 메뉴 포함)
import './index.css';

function Home() {
  return (
    <div className="app-container">
      <h1>결이든에 오신 것을 환영합니다 🌿</h1>
      <p>자연의 편안함과 따뜻한 나눔이 머무는 곳입니다.</p>
    </div>
  );
}

function App() {

  return (
    // 💡 BrowserRouter: 리액트가 주소(URL)를 인식하게 해주는 든든한 울타리입니다.
    <BrowserRouter>
      <Header /> {/* 모든 페이지에서 보이는 헤더 컴포넌트 */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;