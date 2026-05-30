import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/main.css';

function ProductDetail() {
  const { id } = useParams(); // 주소창에 적힌 번호(예: /products/1 의 '1')를 꺼내옵니다.
  const navigate = useNavigate(); // 다시 목록으로 돌아가는 길잡이입니다.
  
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // 💡 백엔드 창고에 번호표를 주고 해당 물품을 조심스레 받아옵니다.
    axios.get(`http://localhost:8080/api/products/${id}`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((error) => {
        console.error("물품 정보를 가져오지 못했습니다:", error);
      });
  }, [id]);

  if (!product) {
    return <div className="loading-text">나눔의 숨결을 들이고 있습니다... 🌱</div>;
  }

  return (
    <main className="main-container detail-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← 목록으로 돌아가기
      </button>

      <div className="detail-content">
        <div className="detail-image-box">
          <img 
            src={product.thumbnailUrl || "https://placehold.co/500x500?text=Gyeol-E-Deun"} 
            alt={product.name} 
          />
        </div>
        
        <div className="detail-info-box">
          <h2 className="detail-name">{product.name}</h2>
          <p className="detail-desc">{product.description}</p>
          <div className="detail-price-box">
            <span className="price">{product.price.toLocaleString()}원</span>
          </div>
          
          {/* 내일 우리가 생명을 불어넣을 장바구니 담기 버튼입니다! */}
          <button 
            className="btn-large-cart" 
            disabled={product.status === 'SOLD_OUT'}
          >
            {product.status === 'SOLD_OUT' ? '품절된 물품입니다' : '바구니에 담기 🌿'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;