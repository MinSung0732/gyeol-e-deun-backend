import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/index.css'; // 디자인 통일을 위해 가져오기
import '../css/main.css'; // 메인 페이지 전용 스타일

function ProductList() {
  // 💡 백엔드에서 받아온 상품 리스트를 담아둘 바구니
  const [products, setProducts] = useState([]);
  // 로딩 상태와 에러 상태를 관리하는 바구니
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 💡 수정됨: 누구나 볼 수 있는 일반 주소(앞문)로 찾아갑니다!
    axios.get('http://localhost:8080/api/admin/products') 
      .then((response) => {
        setProducts(response.data); 
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("상품을 가져오는 중 오류 발생:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="loading-text">결이든의 건강한 상품들을 불러오는 중입니다... 🌱</div>;
  }

  return (
    <main className="main-container">
      <section className="banner-section">
        <h2>자연을 담은 건강한 선택, 결이든 🌱</h2>
        <p>우리 가족이 안심하고 사용할 수 있는 바른 상품들을 만나보세요.</p>
      </section>

      {/* 💡 진짜 상품들이 진열되는 구역 */}
      <section className="product-section">
        <h3>추천 상품</h3>
        
        {products.length === 0 ? (
          <p className="no-product">현재 등록된 상품이 없습니다. 잠시만 기다려주세요! 🌿</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              /* 리액트에서 반복문을 돌릴 때는 고유한 key 값이 필수입니다! */
              <div className="product-card" key={product.productId}>
                <div className="thumbnail-box">
                  {/* 이미지가 없을 때를 대비한 대체 텍스트나 기본 이미지 설정 */}
                  <img 
                    src={product.thumbnailUrl || "https://placehold.co/250x250?text=Gyeol-E-Deun"} 
                    alt={product.name} 
                  />
                  {product.status === 'SOLD_OUT' && <span className="badge sold-out">품절</span>}
                </div>
                
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-bottom">
                    <span className="product-price">
                      {product.price.toLocaleString()}원
                    </span>
                    <button className="btn-cart" disabled={product.status === 'SOLD_OUT'}>
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