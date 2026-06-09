import React from 'react';
import { useNavigate } from 'react-router-dom';

function MyDashboard({ userInfo }) {
  const navigate = useNavigate();

  // 프론트엔드 UI 확인용 가짜 데이터 (Mock Data)
  const mockShippingStatus = {
    paymentCompleted: 1, // 결제완료
    preparing: 2,        // 배송준비
    shipping: 0,         // 배송중
    delivered: 5         // 배송완료
  };

  return (
    <div className="my-dashboard fade-in">
      <div className="dashboard-greeting">
        <h2>{userInfo?.name} 이웃님, 결이든에 머물러 주셔서 감사합니다 🌿</h2>
      </div>

      <div className="shipping-widget">
        <h3 className="section-title">나의 쇼핑 상태</h3>
        <div className="shipping-steps">
          <div className="step">
            <div className="step-icon">💳</div>
            <div className="step-count">{mockShippingStatus.paymentCompleted}</div>
            <div className="step-label">결제완료</div>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step">
            <div className="step-icon">📦</div>
            <div className="step-count">{mockShippingStatus.preparing}</div>
            <div className="step-label">배송준비</div>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step">
            <div className="step-icon">🚚</div>
            <div className="step-count">{mockShippingStatus.shipping}</div>
            <div className="step-label">배송중</div>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step">
            <div className="step-icon">📫</div>
            <div className="step-count">{mockShippingStatus.delivered}</div>
            <div className="step-label">배송완료</div>
          </div>
        </div>
      </div>

      <section>
        <h3 className="section-title">최근 주문/배송 내역</h3>
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>아직 결이든에서 주문하신 내역이 없습니다.</p>
          <button 
            className="btn-outline" 
            style={{ marginTop: '20px' }}
            onClick={() => navigate('/products')}
          >
            건강한 상품 보러가기
          </button>
        </div>
      </section>
    </div>
  );
}

export default MyDashboard;
