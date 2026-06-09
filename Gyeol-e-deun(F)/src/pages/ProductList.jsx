import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import { addToCart } from '../utils/cart';
import { getPrimaryThumbnail } from '../utils/productImages';
import '../css/main.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get(api.products.list)
      .then((response) => {
        setProducts(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('상품을 가져오는 중 오류 발생:', error);
        setIsLoading(false);
      });

    const token = getAccessToken();
    if (token) {
      apiClient.get(api.wishlist.list, { headers: authHeaders(token) })
        .then((response) => {
          setWishlist(response.data.map((item) => item.productId));
        })
        .catch((error) => console.error('찜 목록 조회 실패:', error));
    }
  }, []);

  const handleToggleWishlist = (e, productId) => {
    e.stopPropagation();

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    apiClient.post(api.wishlist.toggle(productId), {}, { headers: authHeaders(token) })
      .then((response) => {
        const isAdded = response.data.isAdded;
        setWishlist((prev) => (
          isAdded ? [...prev, productId] : prev.filter((id) => id !== productId)
        ));
      })
      .catch((error) => {
        console.error('찜하기 실패:', error);
        alert('찜하기 처리에 실패했습니다.');
      });
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      alert(`재고가 부족합니다. (현재 재고: ${product.stock}개)`);
      return;
    }

    try {
      await addToCart({ productId: product.productId, count: 1 }, token);
      if (window.confirm('상품추가완료했습니다. 장바구니로 이동하시겠습니까?')) {
        navigate('/cart');
      }
    } catch (err) {
      console.error('장바구니 담기 오류:', err);
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert(typeof err.response?.data === 'string' ? err.response.data : '장바구니 담기에 실패했습니다.');
      }
    }
  };

  if (isLoading) {
    return <div className="loading-text">결이든의 건강한 상품들을 불러오는 중입니다... 🌱</div>;
  }

  return (
    <main className="main-container">
      <section className="page-banner">
        <span className="page-banner-tag">Healthy Choices</span>
        <h2>자연을 담은 건강한 선택, 결이든 🌱</h2>
        <p>우리 가족이 안심하고 사용할 수 있는 바른 상품들을 만나보세요.</p>
      </section>

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
                onClick={() => navigate(`/products/${product.productId}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="thumbnail-box">
                  <img src={getPrimaryThumbnail(product)} alt={product.name} />
                  <button
                    type="button"
                    className="btn-wishlist"
                    onClick={(e) => handleToggleWishlist(e, product.productId)}
                    title={wishlist.includes(product.productId) ? '찜 해제' : '찜하기'}
                  >
                    {wishlist.includes(product.productId) ? '❤️' : '🤍'}
                  </button>
                  {product.status === 'SOLD_OUT' && <span className="badge sold-out">품절</span>}
                </div>

                <div className="product-info">
                  {product.category && <span className="product-category">{product.category}</span>}
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-bottom">
                    <span className="product-price">{product.price.toLocaleString()}원</span>
                    <button
                      type="button"
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
    </main>
  );
}

export default ProductList;
