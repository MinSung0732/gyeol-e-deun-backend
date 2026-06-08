import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/index.css';
import '../css/home.css';

function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    axios.get('http://localhost:8080/api/members/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setIsAdmin(response.data.role === 'ROLE_ADMIN');
      })
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <div className="home-container">
      <section className="home-hero">
        <h1>결이든에 오신 것을 환영합니다 🌿</h1>
        <p>자연의 편안함과 따뜻한 나눔이 머무는 곳입니다.</p>
      </section>

      <div className="home-actions">
        <Link to="/products" className="home-btn home-btn-primary">
          상품 목록 보기
        </Link>

        {isAdmin && (
          <Link to="/admin/product/add" className="home-btn home-btn-admin">
            상품 등록하기
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;
