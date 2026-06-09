import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import '../css/admin.css';

const CATEGORIES = [
  '건강식품',
  '생활용품',
  '원예/식물',
  '뷰티/케어',
  '식품',
  '기타',
];

const STATUS_OPTIONS = [
  { value: 'ON_SALE', label: '판매중' },
  { value: 'SOLD_OUT', label: '품절' },
  { value: 'HIDDEN', label: '숨김 (목록 미노출)' },
];

async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(api.admin.upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...authHeaders(token),
    },
  });
  return response.data;
}

const MAX_THUMBNAILS = 5;

function ThumbnailGalleryUpload({ items, onAdd, onRemove }) {
  const canAddMore = items.length < MAX_THUMBNAILS;

  return (
    <div className="form-group image-upload-group">
      <label>썸네일 이미지 * (최대 {MAX_THUMBNAILS}장)</label>
      <p className="field-hint">
        상품 목록과 상세 페이지에 노출되는 이미지입니다. 첫 번째 이미지가 목록 대표 이미지로 사용됩니다.
      </p>

      <div className="thumbnail-grid">
        {items.map((item, index) => (
          <div className="thumbnail-slot" key={item.id}>
            <img src={item.preview} alt={`썸네일 ${index + 1}`} />
            <span className="thumbnail-order">{index === 0 ? '대표' : index + 1}</span>
            <button
              type="button"
              className="btn-remove-thumb"
              onClick={() => onRemove(item.id)}
            >
              ×
            </button>
          </div>
        ))}

        {canAddMore && (
          <label className="thumbnail-slot thumbnail-add">
            <span>+ 추가</span>
            <span className="thumb-count">{items.length}/{MAX_THUMBNAILS}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onAdd(files);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function ImageUploadField({ label, hint, preview, onChange, required }) {
  return (
    <div className="form-group image-upload-group">
      <label>{label}</label>
      {hint && <p className="field-hint">{hint}</p>}
      <div className="image-upload-area">
        {preview ? (
          <div className="image-preview-box">
            <img src={preview} alt="미리보기" />
            <button
              type="button"
              className="btn-remove-image"
              onClick={() => onChange(null)}
            >
              이미지 제거
            </button>
          </div>
        ) : (
          <label className="image-dropzone">
            <span>클릭하여 이미지 선택</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              required={required}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function AdminProductAdd() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('ON_SALE');
  const [description, setDescription] = useState('');

  const [thumbnailItems, setThumbnailItems] = useState([]);
  const [detailFile, setDetailFile] = useState(null);
  const [detailPreview, setDetailPreview] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsAdmin(false);
      return;
    }

    apiClient.get(api.members.me, { headers: authHeaders(token) })
      .then((response) => {
        setIsAdmin(response.data.role === 'ROLE_ADMIN');
      })
      .catch(() => setIsAdmin(false));
  }, []);

  const handleAddThumbnails = (files) => {
    const remaining = MAX_THUMBNAILS - thumbnailItems.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setThumbnailItems((prev) => [...prev, ...toAdd]);
  };

  const handleRemoveThumbnail = (id) => {
    setThumbnailItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleDetailChange = (file) => {
    setDetailFile(file);
    setDetailPreview(file ? URL.createObjectURL(file) : null);
  };

  const resolvedCategory = category === '기타' ? customCategory.trim() : category;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (thumbnailItems.length === 0) {
      alert('썸네일 이미지를 최소 1장 등록해 주세요.');
      return;
    }

    if (!resolvedCategory) {
      alert('카테고리를 선택하거나 입력해 주세요.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const thumbnailUrls = [];
      for (const item of thumbnailItems) {
        const url = await uploadImage(item.file, token);
        thumbnailUrls.push(url);
      }

      let detailImageUrl = '';
      if (detailFile) {
        detailImageUrl = await uploadImage(detailFile, token);
      }

      const productData = {
        name: name.trim(),
        price: parseInt(price, 10),
        stock: parseInt(stock, 10),
        description: description.trim(),
        category: resolvedCategory,
        status,
        thumbnailUrls,
        thumbnailUrl: thumbnailUrls[0],
        detailImageUrl,
      };

      await apiClient.post(api.admin.products, productData, {
        headers: authHeaders(token),
      });

      alert('상품이 성공적으로 등록되었습니다! 🌱');
      navigate('/products');
    } catch (error) {
      console.error('상품 등록 오류:', error);
      if (error.response?.status === 403) {
        alert('관리자만 상품을 등록할 수 있습니다.');
      } else {
        alert('상품 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin === null) {
    return <div className="admin-loading">권한을 확인하는 중입니다...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-form-container">
        <div className="form-header">
          <h2>접근 권한이 없습니다</h2>
          <p>상품 등록은 관리자 계정으로 로그인한 경우에만 가능합니다.</p>
          <button type="button" className="btn-submit-nature" onClick={() => navigate('/login')}>
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-form-container admin-form-wide">
      <div className="form-header">
        <h2>상품 등록 🌿</h2>
        <p>쇼핑몰에 노출될 상품 정보를 입력해 주세요.</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h3 className="section-title">기본 정보</h3>

          <div className="form-group">
            <label>상품명 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 유기농 곡물 세트"
              required
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>카테고리 *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">카테고리 선택</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {category === '기타' && (
              <div className="form-group">
                <label>직접 입력 *</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="카테고리명 입력"
                  required
                />
              </div>
            )}
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>판매가 (원) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>재고 수량 (개) *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>판매 상태 *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">이미지</h3>

          <ThumbnailGalleryUpload
            items={thumbnailItems}
            onAdd={handleAddThumbnails}
            onRemove={handleRemoveThumbnail}
          />

          <ImageUploadField
            label="상세 소개 이미지"
            hint="상품 상세 페이지에서 물건을 소개하는 용도의 이미지입니다. (선택)"
            preview={detailPreview}
            onChange={handleDetailChange}
          />
        </section>

        <section className="form-section">
          <h3 className="section-title">상품 설명</h3>

          <div className="form-group">
            <label>상세 설명 *</label>
            <p className="field-hint">
              원재료, 사용법, 보관 방법, 배송 안내 등 고객이 궁금해할 내용을 자세히 작성해 주세요.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`예)\n[상품 소개]\n자연 그대로의 맛을 담은 유기농 곡물 세트입니다.\n\n[원재료 및 함량]\n현미, 귀리, 렌틸콩\n\n[보관 방법]\n직사광선을 피해 서늘하고 건조한 곳에 보관해 주세요.\n\n[배송 안내]\n결제 완료 후 1~2일 내 출고됩니다.`}
              rows="14"
              required
            />
            <span className="char-count">{description.length}자</span>
          </div>
        </section>

        <button type="submit" className="btn-submit-nature" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '상품 등록하기'}
        </button>
      </form>
    </div>
  );
}

export default AdminProductAdd;
