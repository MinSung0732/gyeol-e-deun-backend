import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImageCarousel from '../components/ImageCarousel';
import { getThumbnailUrls } from '../utils/productImages';
import BoxedLayout from '../components/layout/BoxedLayout';
import '../css/main.css';

const STATUS_LABEL = {
  ON_SALE: '판매중',
  SOLD_OUT: '품절',
  HIDDEN: '숨김',
};

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setProduct(null);
    setError(null);
    setQuantity(1);

    axios.get(`http://localhost:8080/api/products/${id}`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((err) => {
        console.error('물품 정보를 가져오지 못했습니다:', err);
        setError('상품 정보를 불러오지 못했습니다.');
      });
  }, [id]);

  if (error) {
    return (
      <BoxedLayout>
        <main className="main-container detail-page">
          <p className="detail-error">{error}</p>
          <button className="btn-back" onClick={() => navigate('/products')}>
            ← 상품 목록으로
          </button>
        </main>
      </BoxedLayout>
    );
  }

  if (!product) {
    return (
      <BoxedLayout>
        <div className="loading-text">나눔의 숨결을 들이고 있습니다... 🌱</div>
      </BoxedLayout>
    );
  }

  const statusLabel = STATUS_LABEL[product.status] || product.status;
  const isSoldOut = product.status === 'SOLD_OUT';
  const thumbnailImages = getThumbnailUrls(product);

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (quantity > product.stock) {
      alert(`재고가 부족합니다. (현재 재고: ${product.stock}개)`);
      return;
    }

    axios.post(
      'http://localhost:8080/api/cart',
      {
        productId: product.productId,
        count: quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      alert(response.data || '장바구니에 상품을 안전하게 담았습니다.');
      // Optional: Ask user if they want to go to cart page
      if (window.confirm('장바구니로 이동하시겠습니까?')) {
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

  return (
    <BoxedLayout>
    <main className="main-container detail-page">
      <button className="btn-back" onClick={() => navigate('/products')}>
        ← 상품 목록으로
      </button>

      <div className="detail-content">
        <div className="detail-gallery">
          <ImageCarousel
            key={product.productId}
            images={thumbnailImages}
            alt={product.name}
            badge={isSoldOut ? (
              <span className="badge sold-out detail-badge">품절</span>
            ) : null}
          />

          {product.detailImageUrl && (
            <div className="detail-image-box detail-image-secondary">
              <img src={product.detailImageUrl} alt={`${product.name} 상세 소개`} />
            </div>
          )}
        </div>

        <div className="detail-info-box">
          {product.category && (
            <span className="detail-category">{product.category}</span>
          )}

          <h2 className="detail-name">{product.name}</h2>

          <div className="detail-meta-row">
            <span className={`detail-status status-${product.status?.toLowerCase()}`}>
              {statusLabel}
            </span>
            <span className="detail-stock">
              재고 {product.stock?.toLocaleString() ?? 0}개
            </span>
          </div>

          <div className="detail-price-box">
            <span className="price">{product.price.toLocaleString()}원</span>
          </div>

          <section className="detail-section">
            <h3>상품 설명</h3>
            <p className="detail-desc">{product.description}</p>
          </section>

          <section className="detail-section detail-info-table">
            <h3>상품 정보</h3>
            <dl>
              <div className="detail-info-row">
                <dt>상품번호</dt>
                <dd>{product.productId}</dd>
              </div>
              <div className="detail-info-row">
                <dt>카테고리</dt>
                <dd>{product.category || '-'}</dd>
              </div>
              <div className="detail-info-row">
                <dt>판매 상태</dt>
                <dd>{statusLabel}</dd>
              </div>
              <div className="detail-info-row">
                <dt>재고</dt>
                <dd>{product.stock?.toLocaleString() ?? 0}개</dd>
              </div>
              <div className="detail-info-row">
                <dt>등록일</dt>
                <dd>{formatDate(product.createdAt)}</dd>
              </div>
              <div className="detail-info-row">
                <dt>최종 수정일</dt>
                <dd>{formatDate(product.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {!isSoldOut && product.stock > 0 && (
            <div className="detail-quantity-box" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>수량:</span>
              <button onClick={handleDecrease} disabled={quantity <= 1} style={{ padding: '5px 10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>-</button>
              <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '16px' }}>{quantity}</span>
              <button onClick={handleIncrease} disabled={quantity >= product.stock} style={{ padding: '5px 10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>+</button>
            </div>
          )}

          <button
            className="btn-large-cart"
            disabled={isSoldOut || product.stock <= 0}
            onClick={handleAddToCart}
          >
            {isSoldOut || product.stock <= 0 ? '품절된 물품입니다' : '바구니에 담기 🌿'}
          </button>
        </div>
      </div>
    </main>
    </BoxedLayout>
  );
}

export default ProductDetail;
