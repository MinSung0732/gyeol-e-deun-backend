import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/index.css'; // 디자인 통일을 위해 가져오기
import '../css/admin.css'; // 이 페이지 전용 스타일


function AdminProductAdd() {
  // 🌱 상품의 정보를 정성껏 담아둘 바구니들입니다.
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  // 📸 파일 첨부 버튼을 눌렀을 때 실행되는 함수
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // 💌 '등록하기' 버튼을 누르면 백엔드로 마음을 전송합니다.
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      let thumbnailUrl = '';
      
      // 💡 [1번] 브라우저 주머니에서 신분증을 꺼냅니다. 
      // (주의: 로그인하실 때 localStorage에 저장한 이름이 'accessToken'인지 꼭 확인해 주세요!)
      const token = localStorage.getItem('accessToken'); 

      // 📸 사진 먼저 업로드
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        // 💡 [2번] 사진 보낼 때 신분증(Authorization)을 봉투에 같이 담아서 보냅니다!
        const imageResponse = await axios.post('http://localhost:8080/api/admin/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // 👈 방금 사진에서 빠져있던 주인공입니다!
          }
        });
        console.log("📸 백엔드가 돌려준 사진 영수증:", imageResponse.data);

        thumbnailUrl = imageResponse.data; 
      }

      const productData = {
        name: name,
        price: parseInt(price),
        stock: parseInt(stock),
        description: description,
        thumbnailUrl: thumbnailUrl,
        status: 'ON_SALE'
      };

      // 💡 [3번] 최종 상품 글을 올릴 때도 신분증을 꼭 다시 보여줍니다!
      await axios.post('http://localhost:8080/api/admin/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}` // 👈 여기도 잊지 말고 챙겨주세요!
        }
      });
      
      alert('우리의 정성이 담긴 상품이 세상에 무사히 피어났습니다! 🌱');
      navigate('/products'); // 상품 목록 페이지로 이동

    } catch (error) {
      console.error('전달 과정에서 아쉬운 오류가 발생했습니다.', error);
    }
  };

  return (
    <div className="admin-form-container">
      <div className="form-header">
        <h2>결이든 나눔의 씨앗 심기 🌿</h2>
        <p>우리 가족과 이웃에게 전할 건강하고 바른 상품의 이야기를 적어주세요.</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>따뜻한 이름</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예) 마음을 다독이는 이끼 테라리움" required />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label>나눔 금액 (원)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" required />
          </div>
          <div className="form-group">
            <label>준비된 수량 (개)</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" required />
          </div>
        </div>

        <div className="form-group">
          <label>자연을 닮은 사진</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" required />
        </div>

        <div className="form-group">
          <label>상품에 담긴 이야기</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="이 상품이 어떤 선한 영향력을 품고 있는지 정성스레 적어주세요..." 
            rows="5" 
            required 
          />
        </div>

        <button type="submit" className="btn-submit-nature">세상에 온기 전하기</button>
      </form>
    </div>
  );
}

export default AdminProductAdd;