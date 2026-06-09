import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './css/index.css';
import './css/layout.css';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import AdminProductAdd from './pages/AdminProductAdd';
import ProductDetail from './pages/ProductDetail';
import MyPage from './pages/MyPage';
import Cart from './pages/Cart';
import FullWidthLayout from './components/layout/FullWidthLayout';
import BoxedLayout from './components/layout/BoxedLayout';

function App() {

  return (
    // 💡 BrowserRouter: 리액트가 주소(URL)를 인식하게 해주는 든든한 울타리입니다.
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            {/* 풀위드 레이아웃: 화면 전체를 꽉 채우는 페이지 */}
            <Route element={<FullWidthLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            {/* 박스드 레이아웃: 최대 너비가 제한되고 중앙 정렬되는 페이지 */}
            <Route element={<BoxedLayout />}>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/admin/product/add" element={<AdminProductAdd />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/cart" element={<Cart />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;