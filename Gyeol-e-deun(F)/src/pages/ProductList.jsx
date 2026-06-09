import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/index.css'; // 디자인 통일을 위해 가져오기
import '../css/main.css'; // 메인 페이지 전용 스타일
import '../css/home.css'; // 홈 배너 스타일 가져오기
import { useNavigate } from 'react-router-dom';
import { getPrimaryThumbnail } from '../utils/productImages';
import FullWidthLayout from '../components/layout/FullWidthLayout';

function ProductList() {
  // 💡 백엔드에서 받아온 상품 리스트를 담아둘 바구니
  const [products, setProducts] = useState([]);
  // 찜한 상품 ID 목록을 담아둘 바구니
  const [wishlist, setWishlist] = useState([]);
  // 로딩 상태와 에러 상태를 관리하는 바구니
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 💡 수정됨: 누구나 볼 수 있는 일반 주소(앞문)로 찾아갑니다!
    axios.get('http://localhost:8080/api/admin/products') 
      .then((response) => {
        setProducts(response.data); 
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("상품을 가져오는 중 오류 발생:", error);
        setIsLoading(false);
      });

    // 로그인된 사용자의 찜 목록 가져오기
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.get('http://localhost:8080/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const wishlistedIds = response.data.map(item => item.productId);
        setWishlist(wishlistedIds);
      })
      .catch((error) => console.error("찜 목록 조회 실패:", error));
    }
  }, []);

  const handleToggleWishlist = (e, productId) => {
    e.stopPropagation(); // 카드 클릭(상세페이지 이동) 방지

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    axios.post(`http://localhost:8080/api/wishlist/toggle/${productId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      const isAdded = response.data.isAdded;
      if (isAdded) {
        setWishlist([...wishlist, productId]);
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
      }
    })
    .catch((error) => {
      console.error("찜하기 실패:", error);
      alert("찜하기 처리에 실패했습니다.");
    });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      alert(`재고가 부족합니다. (현재 재고: ${product.stock}개)`);
      return;
    }

    axios.post(
      'http://localhost:8080/api/cart',
      {
        productId: product.productId,
        count: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      if (window.confirm('상품추가완료했습니다. 장바구니로 이동하시겠습니까?')) {
        navigate('/cart');
      }
    })
    .catch((err) => {
      console.error('장바구니 담기 오류:', err);
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert(typeof err.response?.data === 'string' ? err.response.data : '장바구니 담기에 실패했습니다.');
      }
    });
  };

  if (isLoading) {
    return (
      <FullWidthLayout>
        <div className="container">
          <div className="loading-text">결이든의 건강한 상품들을 불러오는 중입니다... 🌱</div>
        </div>
      </FullWidthLayout>
    );
  }

  return (
    <FullWidthLayout>
    <main className="main-container">
      <section className="home-hero-full" style={{ minHeight: '50vh', marginBottom: '60px' }}>
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <span className="home-hero-tag">Healthy Choices</span>
          <h1>자연을 담은 건강한 선택, 결이든 🌱</h1>
          <p>우리 가족이 안심하고 사용할 수 있는 바른 상품들을 만나보세요.</p>
        </div>
      </section>

      {/* 💡 진짜 상품들이 진열되는 구역 */}
      <div className="container">
        <section className="product-section">
          <h3>추천 상품</h3>
          
          {products.length === 0 ? (
            <p className="no-product">현재 등록된 상품이 없습니다. 잠시만 기다려주세요! 🌿</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div 
                  className="product-card" 
                  key={product.productId}
                  // 💡 [3번] 물품 카드를 클릭하면 상세 방으로 사뿐히 넘어가도록 오솔길을 열어줍니다!
                  onClick={() => navigate(`/products/${product.productId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="thumbnail-box">
                    <img 
                      src={getPrimaryThumbnail(product)} 
                      alt={product.name} 
                    />
                    <button 
                      className="btn-wishlist"
                      onClick={(e) => handleToggleWishlist(e, product.productId)}
                      title={wishlist.includes(product.productId) ? '찜 해제' : '찜하기'}
                    >
                      {wishlist.includes(product.productId) ? '❤️' : '🤍'}
                    </button>
                    {product.status === 'SOLD_OUT' && <span className="badge sold-out">품절</span>}
                  </div>
                  
                  <div className="product-info">
                    {product.category && (
                      <span className="product-category">{product.category}</span>
                    )}
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-bottom">
                      <span className="product-price">
                        {product.price.toLocaleString()}원
                      </span>
                      <button
                        className="btn-cart"
                        disabled={product.status === 'SOLD_OUT' || product.stock <= 0}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        담기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
    </FullWidthLayout>
  );
}

export default ProductList;