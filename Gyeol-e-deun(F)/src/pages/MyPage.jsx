import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BoxedLayout from '../components/layout/BoxedLayout';
import MyDashboard from '../components/MyDashboard';
import '../css/mypage.css';

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]); // 찜 목록 상태 추가
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'wishlist', 'cart', 'profile'

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다. 🌱');
      navigate('/login');
      return;
    }

    // 백엔드에서 내 정보 가져오기
    axios.get('http://localhost:8080/api/members/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      setUserInfo(response.data);
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('사용자 정보 조회 실패:', error);
      alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      localStorage.removeItem('accessToken');
      navigate('/login');
    });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (activeTab === 'cart' && token) {
      axios.get('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        setCartItems(response.data);
      })
      .catch((error) => {
        console.error('장바구니 조회 실패:', error);
      });
    } else if (activeTab === 'wishlist' && token) {
      axios.get('http://localhost:8080/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        setWishlistItems(response.data);
      })
      .catch((error) => {
        console.error('찜 목록 조회 실패:', error);
      });
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <BoxedLayout>
        <div className="container">
          <div className="loading-text" style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: '#666' }}>이웃님의 정보를 정성스레 불러오고 있습니다...</div>
        </div>
      </BoxedLayout>
    );
  }

  // 메뉴별 렌더링 함수
  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <MyDashboard userInfo={userInfo} />;
      case 'wishlist':
        return (
          <section className="fade-in">
            <h3 className="section-title">찜한 상품</h3>
            {wishlistItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💚</div>
                <p>찜한 상품이 없습니다. 마음에 드는 상품에 하트를 눌러보세요.</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {wishlistItems.map(item => (
                  <li key={item.wishlistItemId} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                    <img 
                      src={item.primaryImageUrl || 'https://via.placeholder.com/80'} 
                      alt={item.productName} 
                      onClick={() => navigate(`/products/${item.productId}`)}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 
                        onClick={() => navigate(`/products/${item.productId}`)}
                        style={{ margin: '0 0 5px 0', fontSize: '16px', cursor: 'pointer', display: 'inline-block' }}
                      >
                        {item.productName}
                      </h4>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        <strong>{item.price.toLocaleString()}원</strong>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      case 'cart':
        return (
          <section className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="section-title">내 장바구니</h3>
              <button className="btn-text-link" onClick={() => navigate('/cart')} style={{ fontSize: '14px' }}>자세히 보기 &gt;</button>
            </div>
            {cartItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <p>장바구니에 담긴 상품이 없습니다.</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cartItems.map(item => (
                  <li key={item.cartItemId} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                    <img 
                      src={item.primaryImageUrl || 'https://via.placeholder.com/50'} 
                      alt={item.productName} 
                      onClick={() => navigate(`/products/${item.productId}`)}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 
                        onClick={() => navigate(`/products/${item.productId}`)}
                        style={{ margin: '0 0 5px 0', fontSize: '16px', cursor: 'pointer', display: 'inline-block' }}
                      >
                        {item.productName}
                      </h4>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        {item.price.toLocaleString()}원 x {item.count}개 = <strong>{(item.price * item.count).toLocaleString()}원</strong>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      case 'profile':
        return (
          <section className="fade-in">
            <h3 className="section-title">회원 정보 수정</h3>
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <p>회원 정보 수정 기능은 준비 중입니다.</p>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                가입하신 아이디: <strong>{userInfo?.loginId}</strong><br/>
                이름: <strong>{userInfo?.name}</strong>
              </p>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <BoxedLayout>
      <div className="container">
        <div className="mypage-container">
          {/* 사이드바 메뉴 */}
          <aside className="mypage-sidebar">
            <h2>마이페이지</h2>
            <nav className="mypage-nav">
              <button 
                className={`mypage-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                주문/배송 조회
              </button>
              <button 
                className={`mypage-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                찜한 상품
              </button>
              <button 
                className={`mypage-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
                onClick={() => setActiveTab('cart')}
              >
                장바구니
              </button>
              <button 
                className={`mypage-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                회원 정보 수정
              </button>
            </nav>
          </aside>

          {/* 메인 콘텐츠 영역 */}
          <main className="mypage-content">
            {/* 탭별 상세 내용 */}
            {renderContent()}
          </main>
        </div>
      </div>
    </BoxedLayout>
  );
}

export default MyPage;