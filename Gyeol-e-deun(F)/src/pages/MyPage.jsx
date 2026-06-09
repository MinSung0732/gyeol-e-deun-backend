import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import { IMAGE_PLACEHOLDER } from '../utils/productImages';
import MyDashboard from '../components/MyDashboard';
import '../css/mypage.css';

function ItemList({ items, onNavigate }) {
  return (
    <ul className="item-list">
      {items.map((item) => (
        <li key={item.wishlistItemId || item.cartItemId} className="item-list-row">
          <img
            src={item.primaryImageUrl || IMAGE_PLACEHOLDER.thumb}
            alt={item.productName}
            onClick={() => onNavigate(item.productId)}
            className="item-list-thumb"
          />
          <div className="item-list-body">
            <h4 onClick={() => onNavigate(item.productId)} className="item-list-name">
              {item.productName}
            </h4>
            <p className="item-list-meta">
              {item.count
                ? `${item.price.toLocaleString()}원 x ${item.count}개 = ${(item.price * item.count).toLocaleString()}원`
                : `${item.price.toLocaleString()}원`}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요한 서비스입니다. 🌱');
      navigate('/login');
      return;
    }

    apiClient.get(api.members.me, { headers: authHeaders(token) })
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
    const token = getAccessToken();
    if (!token) return;

    if (activeTab === 'cart') {
      apiClient.get(api.cart.list, { headers: authHeaders(token) })
        .then((response) => setCartItems(response.data))
        .catch((error) => console.error('장바구니 조회 실패:', error));
    } else if (activeTab === 'wishlist') {
      apiClient.get(api.wishlist.list, { headers: authHeaders(token) })
        .then((response) => setWishlistItems(response.data))
        .catch((error) => console.error('찜 목록 조회 실패:', error));
    }
  }, [activeTab]);

  if (isLoading) {
    return <div className="loading-text">이웃님의 정보를 불러오고 있습니다...</div>;
  }

  const goToProduct = (productId) => navigate(`/products/${productId}`);

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
              <ItemList items={wishlistItems} onNavigate={goToProduct} />
            )}
          </section>
        );
      case 'cart':
        return (
          <section className="fade-in">
            <div className="mypage-section-header">
              <h3 className="section-title">내 장바구니</h3>
              <button type="button" className="btn-text-link" onClick={() => navigate('/cart')}>
                자세히 보기 &gt;
              </button>
            </div>
            {cartItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <p>장바구니에 담긴 상품이 없습니다.</p>
              </div>
            ) : (
              <ItemList items={cartItems} onNavigate={goToProduct} />
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
              <p className="profile-summary">
                가입하신 아이디: <strong>{userInfo?.loginId}</strong><br />
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
    <div className="mypage-container">
      <aside className="mypage-sidebar">
        <h2>마이페이지</h2>
        <nav className="mypage-nav">
          {[
            ['orders', '주문/배송 조회'],
            ['wishlist', '찜한 상품'],
            ['cart', '장바구니'],
            ['profile', '회원 정보 수정'],
          ].map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              className={`mypage-nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="mypage-content">{renderContent()}</main>
    </div>
  );
}

export default MyPage;
