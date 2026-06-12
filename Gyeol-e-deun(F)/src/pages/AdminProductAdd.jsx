import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import '../css/admin.css';

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
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('ON_SALE');
  const [description, setDescription] = useState('');

  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState('');
  const [selectedMinorId, setSelectedMinorId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const [thumbnailItems, setThumbnailItems] = useState([]);
  const [detailFile, setDetailFile] = useState(null);
  const [detailPreview, setDetailPreview] = useState(null);

  const loadCategories = () => {
    apiClient.get(api.categories.list)
      .then((response) => setCategoryTree(response.data))
      .catch((error) => {
        console.error('카테고리 조회 실패:', error);
        setCategoryTree([]);
      });
  };

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

    loadCategories();
  }, []);

  const topCategories = useMemo(() => categoryTree, [categoryTree]);
  const selectedMajor = topCategories.find((category) => String(category.id) === selectedMajorId);
  const minorCategories = selectedMajor?.children || [];

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

  const selectedMinor = minorCategories.find((category) => String(category.id) === selectedMinorId);
  const resolvedCategory = selectedMinor
    ? `${selectedMajor?.name} > ${selectedMinor.name}`
    : selectedMajor
      ? selectedMajor.name
      : customCategory.trim();

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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('카테고리 이름을 입력해 주세요.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setIsAddingCategory(true);
    try {
      await apiClient.post(api.categories.add, {
        name: newCategoryName.trim(),
        parentId: newParentId ? Number(newParentId) : null,
      }, {
        headers: authHeaders(token),
      });

      setNewCategoryName('');
      setNewParentId('');
      loadCategories();
      alert('카테고리가 추가되었습니다.');
    } catch (error) {
      console.error('카테고리 추가 오류:', error);
      alert('카테고리 추가 중 오류가 발생했습니다.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (category.children && category.children.length > 0) {
      alert('하위 카테고리가 존재하여 대분류를 삭제할 수 없습니다. 소분류를 먼저 삭제해 주세요.');
      return;
    }

    if (!window.confirm(`'${category.name}' 카테고리를 정말 삭제하시겠습니까?`)) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      await apiClient.delete(api.categories.delete(category.id), {
        headers: authHeaders(token),
      });
      loadCategories();
      alert('카테고리가 삭제되었습니다.');
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      alert(error.response?.data?.message || '카테고리 삭제 중 오류가 발생했습니다.');
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

        <section className="form-section category-manager-section">
        <h3 className="section-title">카테고리 관리</h3>
        <p className="field-hint">
          관리자 페이지에서 대분류/소분류를 추가하면 상품 등록 시 바로 선택해서 사용할 수 있습니다.
        </p>
        <div className="category-manager-grid">
          <div className="form-group">
            <label>새 카테고리 이름 *</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="예) 영양제"
            />
          </div>
          <div className="form-group">
            <label>상위 카테고리</label>
            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
            >
              <option value="">대분류로 추가</option>
              {topCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group category-add-button-group">
            <button
              type="button"
              className="btn-submit-nature btn-add-category"
              onClick={handleAddCategory}
              disabled={isAddingCategory}
            >
              {isAddingCategory ? '추가 중...' : '카테고리 추가'}
            </button>
          </div>
        </div>

        <div className="category-list-admin">
          {topCategories.length === 0 ? (
            <p>등록된 카테고리가 없습니다.</p>
          ) : (
            topCategories.map((category) => (
              <div key={category.id} className="category-list-item">
                <div className="category-major-header">
                  <strong>{category.name}</strong>
                  <button type="button" className="btn-delete-category" onClick={() => handleDeleteCategory(category)}>×</button>
                </div>
                {category.children?.length > 0 && (
                  <div className="category-children">
                    {category.children.map((child) => (
                      <div key={child.id} className="category-child">
                        <span>- {child.name}</span>
                        <button type="button" className="btn-delete-category" onClick={() => handleDeleteCategory(child)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

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
              <label>대분류</label>
              <select
                value={selectedMajorId}
                onChange={(e) => {
                  setSelectedMajorId(e.target.value);
                  setSelectedMinorId('');
                  setCustomCategory('');
                }}
              >
                <option value="">대분류 선택</option>
                {topCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>소분류</label>
              <select
                value={selectedMinorId}
                onChange={(e) => setSelectedMinorId(e.target.value)}
                disabled={!selectedMajorId || minorCategories.length === 0}
              >
                <option value="">소분류 선택</option>
                {minorCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>직접 입력</label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="카테고리를 직접 입력하려면 작성하세요."
              disabled={!!selectedMajorId}
            />
            <p className="field-hint">
              대분류 또는 소분류를 선택하면 자동으로 선택한 카테고리가 적용됩니다.
            </p>
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
