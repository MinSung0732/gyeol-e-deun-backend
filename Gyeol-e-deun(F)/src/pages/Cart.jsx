import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BoxedLayout from '../components/layout/BoxedLayout';
import '../css/main.css';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    axios.get('http://localhost:8080/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      setCartItems(response.data);
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('장바구니 조회 실패:', error);
      setIsLoading(false);
      if (error.response?.status === 401) {
        alert('로그인 세션이 만료되었습니다.');
        navigate('/login');
      }
    });
  }, [navigate]);

  if (isLoading) {
    return (
      <BoxedLayout>
        <div className="container">
          <div className="loading-text" style={{ textAlign: 'center', padding: '100px 0' }}>
            장바구니를 불러오는 중입니다... 🌱
          </div>
        </div>
      </BoxedLayout>
    );
  }

  const handleDelete = async (cartItemId) => {
    if (!window.confirm('장바구니에서 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8080/api/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 삭제 성공 후 프론트엔드 상태 업데이트
      setCartItems(cartItems.filter(item => item.cartItemId !== cartItemId));
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      console.error('장바구니 상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.count), 0);

  return (
    <BoxedLayout>
      <div className="container">
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>내 장바구니 🛒</h2>
        
        {cartItems.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '50px 0' }}>
            <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</div>
            <p>장바구니에 담긴 상품이 없습니다.</p>
            <button className="btn-cart" style={{ marginTop: '20px' }} onClick={() => navigate('/products')}>상품 구경가기</button>
          </div>
        ) : (
          <div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {cartItems.map(item => (
                <li key={item.cartItemId} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0' }}>
                  <img 
                    src={item.primaryImageUrl || 'https://via.placeholder.com/80'} 
                    alt={item.productName} 
                    onClick={() => navigate(`/products/${item.productId}`)}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 
                      onClick={() => navigate(`/products/${item.productId}`)}
                      style={{ margin: '0 0 5px 0', cursor: 'pointer', display: 'inline-block' }}
                    >
                      {item.productName}
                    </h4>
                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{item.price.toLocaleString()}원 x {item.count}개</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{(item.price * item.count).toLocaleString()}원</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.cartItemId)}
                    style={{
                      backgroundColor: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      marginLeft: '15px',
                      fontSize: '14px'
                    }}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '18px' }}>
              <strong>총 결제 예상 금액: {totalPrice.toLocaleString()}원</strong>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn-cart" onClick={() => alert('결제 기능은 준비 중입니다.')}>주문하기</button>
            </div>
          </div>
        )}
      </div>
    </BoxedLayout>
  );
}

export default Cart;