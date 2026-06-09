import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import { IMAGE_PLACEHOLDER } from '../utils/productImages';
import '../css/main.css';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    apiClient.get(api.cart.list, { headers: authHeaders(token) })
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

  const handleDelete = async (cartItemId) => {
    if (!window.confirm('장바구니에서 이 상품을 삭제하시겠습니까?')) return;

    try {
      const token = getAccessToken();
      await apiClient.delete(api.cart.remove(cartItemId), { headers: authHeaders(token) });
      setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      console.error('장바구니 상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div className="loading-text">장바구니를 불러오는 중입니다... 🌱</div>;
  }

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.count), 0);

  return (
    <div className="cart-page">
      <h2 className="cart-title">내 장바구니 🛒</h2>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>장바구니에 담긴 상품이 없습니다.</p>
          <button type="button" className="btn-cart" onClick={() => navigate('/products')}>상품 구경가기</button>
        </div>
      ) : (
        <>
          <ul className="item-list">
            {cartItems.map((item) => (
              <li key={item.cartItemId} className="item-list-row">
                <img
                  src={item.primaryImageUrl || IMAGE_PLACEHOLDER.thumb}
                  alt={item.productName}
                  onClick={() => navigate(`/products/${item.productId}`)}
                  className="item-list-thumb item-list-thumb-lg"
                />
                <div className="item-list-body">
                  <h4 onClick={() => navigate(`/products/${item.productId}`)} className="item-list-name">
                    {item.productName}
                  </h4>
                  <p className="item-list-meta">{item.price.toLocaleString()}원 x {item.count}개</p>
                  <p className="item-list-price">{(item.price * item.count).toLocaleString()}원</p>
                </div>
                <button type="button" className="btn-delete" onClick={() => handleDelete(item.cartItemId)}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <strong>총 결제 예상 금액: {totalPrice.toLocaleString()}원</strong>
          </div>
          <div className="cart-actions">
            <button type="button" className="btn-cart" onClick={() => alert('결제 기능은 준비 중입니다.')}>
              주문하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
