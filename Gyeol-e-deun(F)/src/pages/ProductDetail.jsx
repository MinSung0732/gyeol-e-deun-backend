import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImageCarousel from '../components/ImageCarousel';
import { getThumbnailUrls } from '../utils/productImages';
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

  useEffect(() => {
    setProduct(null);
    setError(null);

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
      <main className="main-container detail-page">
        <p className="detail-error">{error}</p>
        <button className="btn-back" onClick={() => navigate('/products')}>
          ← 상품 목록으로
        </button>
      </main>
    );
  }

  if (!product) {
    return <div className="loading-text">나눔의 숨결을 들이고 있습니다... 🌱</div>;
  }

  const statusLabel = STATUS_LABEL[product.status] || product.status;
  const isSoldOut = product.status === 'SOLD_OUT';
  const thumbnailImages = getThumbnailUrls(product);

  return (
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

          <button
            className="btn-large-cart"
            disabled={isSoldOut || product.stock <= 0}
          >
            {isSoldOut || product.stock <= 0 ? '품절된 물품입니다' : '바구니에 담기 🌿'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
