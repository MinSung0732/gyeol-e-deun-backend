import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './css/index.css';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import AdminProductAdd from './pages/AdminProductAdd';
import ProductDetail from './pages/ProductDetail';

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