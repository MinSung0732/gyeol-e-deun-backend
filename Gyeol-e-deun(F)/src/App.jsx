import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header'; // 헤더 컴포넌트 (로그인 상태에 따라 다르게 보이는 메뉴 포함)
import './css/index.css'; // 전체적인 디자인 통일을 위한 CSS
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import AdminProductAdd from './pages/AdminProductAdd';
import ProductDetail from './pages/ProductDetail'; // 상품 상세 페이지 컴포넌트 추가

function Home() {
  return (
    // 💡 리액트는 여러 요소가 있을 때 반드시 하나의 큰 울타리(div)로 감싸주어야 합니다.
    <div className="app-container">
      <h1>결이든에 오신 것을 환영합니다 🌿</h1>
      <p>자연의 편안함과 따뜻한 나눔이 머무는 곳입니다.</p>
      
      {/* products 페이지로 이동하는 링크 */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/products" style={{ marginRight: '15px' }}>상품 목록 보기</Link>
        {/* admin/product/add 페이지로 이동하는 링크 */}
        <Link to="/admin/product/add">상품 추가하기</Link>
      </div>
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
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/admin/product/add" element={<AdminProductAdd />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;