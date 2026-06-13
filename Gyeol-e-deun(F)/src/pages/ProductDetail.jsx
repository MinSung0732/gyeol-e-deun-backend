import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, api, getAccessToken } from '../utils/api';
import { addToCart } from '../utils/cart';
import ImageCarousel from '../components/ImageCarousel';
import { getThumbnailUrls } from '../utils/productImages';
import '../css/main.css';

const productViewRecordTimes = new Map();
const VIEW_RECORD_COOLDOWN_MS = 1000;

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

function getPricing(product) {
  const originalPrice = product.originalPrice ?? product.price;
  return {
    originalPrice,
    currentPrice: product.price,
    isDiscounted: originalPrice > product.price,
    discountPercent: product.discountPercent,
  };
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProduct(null);
    setError(null);
    setQuantity(1);

    apiClient.get(api.products.detail(id))
      .then((response) => {
        const prod = response.data;
        setProduct(prod);

        const now = Date.now();
        const lastRecordedAt = productViewRecordTimes.get(prod.productId) || 0;
        if (now - lastRecordedAt > VIEW_RECORD_COOLDOWN_MS) {
          productViewRecordTimes.set(prod.productId, now);
          apiClient.post(api.products.view(prod.productId)).catch((viewError) => {
            productViewRecordTimes.delete(prod.productId);
            console.error('상품 조회수 기록 실패:', viewError);
          });
        }

        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updatedRecent = [
          {
            productId: prod.productId,
            productName: prod.name,
            primaryImageUrl: prod.thumbnailUrl,
            price: prod.price,
          },
          ...recent.filter((item) => item.productId !== prod.productId),
        ].slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      })
      .catch((err) => {
        console.error('상품 정보를 가져오지 못했습니다.', err);
        setError('상품 정보를 불러오지 못했습니다.');
      });
  }, [id]);

  if (error) {
    return (
      <main className="main-container detail-page">
        <p className="detail-error">{error}</p>
        <button type="button" className="btn-back" onClick={() => navigate('/products')}>
          상품 목록으로
        </button>
      </main>
    );
  }

  if (!product) {
    return <div className="loading-text">상품 정보를 불러오는 중입니다...</div>;
  }

  if (product.status === 'HIDDEN') {
    return (
      <main className="main-container detail-page">
        <p className="detail-error">현재 노출되지 않는 상품입니다.</p>
        <button type="button" className="btn-back" onClick={() => navigate('/products')}>
          상품 목록으로
        </button>
      </main>
    );
  }

  const statusLabel = STATUS_LABEL[product.status] || product.status;
  const isSoldOut = product.status === 'SOLD_OUT';
  const thumbnailImages = getThumbnailUrls(product);
  const pricing = getPricing(product);

  const handleAddToCart = async () => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (quantity > product.stock) {
      alert(`재고가 부족합니다. (현재 재고: ${product.stock}개)`);
      return;
    }

    try {
      const message = await addToCart({ productId: product.productId, count: quantity }, token);
      alert(message || '장바구니에 상품을 담았습니다.');
      if (window.confirm('장바구니로 이동하시겠습니까?')) {
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

  return (
    <main className="main-container detail-page">
      <button type="button" className="btn-back" onClick={() => navigate('/products')}>
        상품 목록으로
      </button>

      <div className="detail-content">
        <div className="detail-gallery">
          <ImageCarousel
            key={product.productId}
            images={thumbnailImages}
            alt={product.name}
            badge={isSoldOut ? <span className="badge sold-out detail-badge">품절</span> : null}
          />

          {product.detailImageUrl && (
            <div className="detail-image-box detail-image-secondary">
              <img src={product.detailImageUrl} alt={`${product.name} 상세 설명`} />
            </div>
          )}
        </div>

        <div className="detail-info-box">
          {product.category && <span className="detail-category">{product.category}</span>}
          <h2 className="detail-name">{product.name}</h2>

          <div className="detail-meta-row">
            <span className={`detail-status status-${product.status?.toLowerCase()}`}>{statusLabel}</span>
            <span className="detail-stock">재고 {product.stock?.toLocaleString() ?? 0}개</span>
          </div>

          <div className="detail-price-box">
            <div className="detail-price-wrap">
              {pricing.isDiscounted ? (
                <>
                  <span className="detail-price-original">{pricing.originalPrice.toLocaleString()}원</span>
                  <span className="price price-sale">{pricing.currentPrice.toLocaleString()}원</span>
                  {pricing.discountPercent ? <span className="discount-badge">-{pricing.discountPercent}%</span> : null}
                </>
              ) : (
                <span className="price">{pricing.currentPrice.toLocaleString()}원</span>
              )}
            </div>
          </div>

          <section className="detail-section">
            <h3>상품 설명</h3>
            <p className="detail-desc">{product.description}</p>
          </section>

          <section className="detail-section detail-info-table">
            <h3>상품 정보</h3>
            <dl>
              <div className="detail-info-row"><dt>상품번호</dt><dd>{product.productId}</dd></div>
              <div className="detail-info-row"><dt>카테고리</dt><dd>{product.category || '-'}</dd></div>
              <div className="detail-info-row"><dt>판매 상태</dt><dd>{statusLabel}</dd></div>
              <div className="detail-info-row"><dt>재고</dt><dd>{product.stock?.toLocaleString() ?? 0}개</dd></div>
              <div className="detail-info-row"><dt>등록일</dt><dd>{formatDate(product.createdAt)}</dd></div>
              <div className="detail-info-row"><dt>최종 수정일</dt><dd>{formatDate(product.updatedAt)}</dd></div>
            </dl>
          </section>

          {!isSoldOut && product.stock > 0 && (
            <div className="detail-quantity-box">
              <span className="detail-quantity-label">수량:</span>
              <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} disabled={quantity <= 1}>-</button>
              <span className="detail-quantity-value">{quantity}</span>
              <button type="button" onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))} disabled={quantity >= product.stock}>+</button>
            </div>
          )}

          <button
            type="button"
            className="btn-large-cart"
            disabled={isSoldOut || product.stock <= 0}
            onClick={handleAddToCart}
          >
            {isSoldOut || product.stock <= 0 ? '품절된 상품입니다' : '장바구니에 담기'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
