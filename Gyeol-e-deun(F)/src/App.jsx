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
import AdminProductList from './pages/AdminProductList';
import ProductDetail from './pages/ProductDetail';
import MyPage from './pages/MyPage';
import Cart from './pages/Cart';
import FullWidthLayout from './components/layout/FullWidthLayout';
import BoxedLayout from './components/layout/BoxedLayout';
import CenteredBoxedLayout from './components/layout/CenteredBoxedLayout';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            <Route element={<FullWidthLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            <Route element={<CenteredBoxedLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<BoxedLayout />}>
              <Route path="/signup" element={<Signup />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/admin/product/add" element={<AdminProductAdd />} />
              <Route path="/admin/products" element={<AdminProductList />} />
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
