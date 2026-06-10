import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import '../css/admin.css';

function AdminProductList() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(0);
  const [pageSize] = useState(40);
  const [isLoading, setIsLoading] = useState(true);
  const [discountPercent, setDiscountPercent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadProducts = (pageIndex = 0) => {
    const token = getAccessToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    apiClient.get(api.admin.products, {
      headers: authHeaders(token),
      params: { page: pageIndex, size: pageSize },
    })
      .then((response) => {
        setProducts(response.data);
        setIsLoading(false);
      })
      .catch((loadError) => {
        console.error('관리자 상품 목록 로드 실패:', loadError);
        setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    apiClient.get(api.members.me, { headers: authHeaders(token) })
      .then((response) => {
        const isAdminUser = response.data.role === 'ROLE_ADMIN';
        setIsAdmin(isAdminUser);
        if (isAdminUser) {
          loadProducts(page);
        } else {
          setError('관리자 권한이 필요합니다.');
        }
      })
      .catch(() => {
        setIsAdmin(false);
        setError('관리자 인증에 실패했습니다.');
        setIsLoading(false);
      });
  }, [page]);

  const displayedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const toggleSelect = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(products.map((product) => product.productId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedIds.size === 0) {
      alert('먼저 하나 이상의 상품을 선택하세요.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const requestBody = {
      productIds: Array.from(selectedIds),
    };

    if (actionType === 'discount') {
      const percent = Number(discountPercent);
      if (!percent || percent <= 0 || percent > 100) {
        alert('할인율은 1 ~ 100 사이 숫자여야 합니다.');
        return;
      }
      requestBody.discountPercent = percent;
    }

    if (actionType === 'sold_out') {
      requestBody.status = 'SOLD_OUT';
    }

    if (actionType === 'hide') {
      requestBody.status = 'HIDDEN';
    }

    if (!requestBody.status && requestBody.discountPercent == null) {
      alert('적용할 작업을 선택하세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.patch(api.admin.bulkProducts, requestBody, {
        headers: authHeaders(token),
      });
      setSelectedIds(new Set());
      setDiscountPercent('');
      loadProducts(page);
      alert('선택한 상품에 작업을 적용했습니다.');
    } catch (updateError) {
      console.error('관리자 상품 일괄 수정 오류:', updateError);
      setError('일괄 수정 중 오류가 발생했습니다.');
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
          <p>상품 관리는 관리자 계정으로 로그인한 경우에만 가능합니다.</p>
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
        <h2>관리자 상품 목록</h2>
        <p>한 페이지에 최대 {pageSize}개까지 목록으로 확인하고 일괄 작업을 수행할 수 있습니다.</p>
      </div>

      <div className="admin-action-bar">
        <div className="action-group">
          <label className="action-label">할인 적용</label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="%"
            min="1"
            max="100"
          />
          <button
            type="button"
            className="btn-submit-nature btn-small"
            onClick={() => handleBulkAction('discount')}
            disabled={isSubmitting}
          >할인 적용</button>
        </div>
        <div className="action-group">
          <button
            type="button"
            className="btn-submit-nature btn-small"
            onClick={() => handleBulkAction('sold_out')}
            disabled={isSubmitting}
          >매진 처리</button>
          <button
            type="button"
            className="btn-submit-nature btn-small btn-secondary"
            onClick={() => handleBulkAction('hide')}
            disabled={isSubmitting}
          >숨김 처리</button>
        </div>
      </div>

      {error && <p className="admin-error-text">{error}</p>}

      <div className="admin-table-wrapper">
        <table className="admin-product-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.size === products.length && products.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>ID</th>
              <th>상품명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>재고</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="table-loading">상품 목록을 불러오는 중입니다...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">등록된 상품이 없습니다.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.productId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.productId)}
                      onChange={() => toggleSelect(product.productId)}
                    />
                  </td>
                  <td>{product.productId}</td>
                  <td>{product.name}</td>
                  <td>{product.category || '-'}</td>
                  <td>{product.price.toLocaleString()}원</td>
                  <td>{product.stock}</td>
                  <td>{product.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button
          type="button"
          className="btn-submit-nature btn-small btn-secondary"
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0 || isLoading}
        >이전</button>
        <span>페이지 {page + 1}</span>
        <button
          type="button"
          className="btn-submit-nature btn-small btn-secondary"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoading || products.length < pageSize}
        >다음</button>
      </div>

      <p className="admin-footnote">선택된 상품: {displayedCount}개</p>
    </div>
  );
}

export default AdminProductList;
