import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, api, authHeaders } from '../utils/api';
import '../css/home.css';

function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    apiClient.get(api.members.me, { headers: authHeaders(token) })
      .then((response) => setIsAdmin(response.data.role === 'ROLE_ADMIN'))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (window.location.hash === '#about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero-full">
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <span className="home-hero-tag">Natural & Warm Sharing</span>
          <h1>결이든에 오신 것을 환영합니다 🌿</h1>
          <p>자연의 편안함과 따뜻한 나눔이 머무는 곳, 건강한 선택을 시작해 보세요.</p>
          <div className="home-actions">
            <Link to="/products" className="home-btn home-btn-primary">상품 둘러보기</Link>
            {isAdmin && (
              <>
                <Link to="/admin/product/add" className="home-btn home-btn-admin">상품 등록하기</Link>
                <Link to="/admin/products" className="home-btn home-btn-admin">상품 관리하기</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="home-about-full" id="about">
        <div className="home-about-grid">
          <div className="home-about-text">
            <span className="home-section-label">About Gyeol-e-deun</span>
            <h2>결이든은 어떤 곳인가요?</h2>
            <p>
              결이든은 우리 가족이 안심하고 사용할 수 있는 바른 상품을 만나는 공간입니다.
              자연에서 온 재료와 정직한 생산 과정을 바탕으로, 건강하고 따뜻한 나눔을 이어가고 있습니다.
            </p>
            <p>
              단순히 물건을 파는 쇼핑몰이 아니라, 이웃과 함께 살아가는 마음을 담은 브랜드입니다.
              작은 선택 하나하나가 더 나은 내일을 만든다고 믿습니다.
            </p>
          </div>
          <div className="home-about-cards">
            <article className="home-value-card">
              <span className="home-value-icon">🌱</span>
              <h3>자연 친화</h3>
              <p>자연 그대로의 가치를 존중하며, 건강한 재료와 생산 방식을 고집합니다.</p>
            </article>
            <article className="home-value-card">
              <span className="home-value-icon">🤝</span>
              <h3>따뜻한 나눔</h3>
              <p>이웃과 지역 사회에 긍정적인 영향을 주는 상품과 활동을 지향합니다.</p>
            </article>
            <article className="home-value-card">
              <span className="home-value-icon">✨</span>
              <h3>정직한 품질</h3>
              <p>투명한 정보와 꾸준한 품질 관리로 믿을 수 있는 쇼핑 경험을 제공합니다.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-cta-full">
        <h2>지금, 결이든의 상품을 만나보세요</h2>
        <p>자연이 전하는 편안함을 일상에 담아 보세요.</p>
        <Link to="/products" className="home-btn home-btn-primary home-btn-lg">추천 상품 보러가기</Link>
      </section>
    </div>
  );
}

export default Home;
