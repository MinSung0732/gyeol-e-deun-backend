import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import '../css/admin.css';

function AdminProductList() {
  const hasToken = Boolean(getAccessToken());
  const [isAdmin, setIsAdmin] = useState(hasToken ? null : false);
  const [authChecked, setAuthChecked] = useState(!hasToken);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(0);
  const [pageSize] = useState(40);
  const [isLoading, setIsLoading] = useState(hasToken);
  const [discountPercent, setDiscountPercent] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockValue, setStockValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadCategories = useCallback(async () => {
    try {
      const response = await apiClient.get(api.categories.list);
      setCategories(response.data || []);
    } catch (loadError) {
      console.error('카테고리 조회 실패:', loadError);
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const collected = [];
      let pageIndex = 0;

      while (true) {
        const response = await apiClient.get(api.admin.products, {
          headers: authHeaders(token),
          params: { page: pageIndex, size: pageSize },
        });
        const batch = Array.isArray(response.data) ? response.data : [];
        collected.push(...batch);
        if (batch.length < pageSize) {
          break;
        }
        pageIndex += 1;
      }

      setProducts(collected);
    } catch (loadError) {
      console.error('관리자 상품 목록 로드 실패:', loadError);
      setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    apiClient.get(api.members.me, { headers: authHeaders(token) })
      .then((response) => {
        const adminFlag = response.data.role === 'ROLE_ADMIN';
        setIsAdmin(adminFlag);
        setAuthChecked(true);
        if (adminFlag) {
          loadCategories();
          loadProducts();
        } else {
          setError('관리자 권한이 필요합니다.');
        }
      })
      .catch(() => {
        setAuthChecked(true);
        setError('관리자 인증에 실패했습니다.');
        setIsLoading(false);
      });
  }, [loadCategories, loadProducts]);

  const flattenedCategories = useMemo(() => {
    const result = [];
    const traverse = (items, parent = null) => {
      items.forEach((item) => {
        result.push({
          id: item.id,
          name: item.name,
          parentId: parent?.id ?? null,
          parentName: parent?.name ?? null,
        });
        if (item.children?.length) {
          traverse(item.children, item);
        }
      });
    };
    traverse(categories);
    return result;
  }, [categories]);

  const rootCategories = useMemo(() => categories, [categories]);
  const selectedCategory = useMemo(
    () => flattenedCategories.find((category) => category.id === selectedCategoryId) || null,
    [flattenedCategories, selectedCategoryId],
  );

  const getChildCategories = (parentId) => {
    const parent = categories.find((category) => category.id === parentId);
    return parent?.children || [];
  };

  const categoryMatches = (value, category) => {
    if (!category) return true;
    if (!value) return false;

    const normalized = value.trim();
    if (category.parentId == null) {
      return (
        normalized === category.name ||
        normalized.startsWith(`${category.name} >`) ||
        normalized.endsWith(`> ${category.name}`)
      );
    }

    if (category.parentName) {
      return (
        normalized === `${category.parentName} > ${category.name}` ||
        normalized === category.name ||
        normalized.endsWith(category.name)
      );
    }

    return normalized === category.name;
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => (
    products.filter((product) => {
      const categoryOk = categoryMatches(product.category, selectedCategory);
      const searchOk = !normalizedSearch
        || String(product.productId).includes(normalizedSearch)
        || (product.name || '').toLowerCase().includes(normalizedSearch);
      return categoryOk && searchOk;
    })
  ), [products, selectedCategory, normalizedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const currentProducts = filteredProducts.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const displayedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const selectCategory = (categoryId, shouldToggleExpand = false) => {
    setSelectedCategoryId(categoryId);
    setPage(0);
    setSelectedIds(new Set());
    if (shouldToggleExpand) {
      setExpandedCategoryIds((prev) => (
        prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId]
      ));
    }
  };

  const selectAllCategories = () => {
    setSelectedCategoryId(null);
    setExpandedCategoryIds(
      rootCategories
        .filter((category) => (category.children?.length || 0) > 0)
        .map((category) => category.id),
    );
    setPage(0);
    setSelectedIds(new Set());
  };

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
      setSelectedIds(new Set(currentProducts.map((product) => product.productId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedIds.size === 0) {
      alert('먼저 하나 이상의 상품을 선택해 주세요.');
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

    if (actionType === 'original_price') {
      if (!originalPrice.trim()) {
        alert('원가를 입력해 주세요.');
        return;
      }
      const value = Number(originalPrice);
      if (Number.isNaN(value) || value < 0) {
        alert('원가는 0 이상 숫자로 입력해 주세요.');
        return;
      }
      requestBody.originalPrice = value;
    }

    if (actionType === 'stock') {
      if (!stockValue.trim()) {
        alert('재고를 입력해 주세요.');
        return;
      }
      const value = Number(stockValue);
      if (Number.isNaN(value) || value < 0) {
        alert('재고는 0 이상 숫자로 입력해 주세요.');
        return;
      }
      requestBody.stock = value;
    }

    if (actionType === 'discount_cancel') {
      requestBody.resetDiscount = true;
    }

    if (actionType === 'sold_out_restore') {
      requestBody.restoreSoldOut = true;
    }

    if (actionType === 'hidden_restore') {
      requestBody.restoreHidden = true;
    }

    if (actionType === 'sold_out') {
      requestBody.status = 'SOLD_OUT';
    }

    if (actionType === 'hide') {
      requestBody.status = 'HIDDEN';
    }

    if (
      !requestBody.status
      && requestBody.discountPercent == null
      && requestBody.originalPrice == null
      && requestBody.stock == null
      && !requestBody.resetDiscount
      && !requestBody.restoreSoldOut
      && !requestBody.restoreHidden
    ) {
      alert('적용할 작업을 선택해 주세요.');
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
      setOriginalPrice('');
      setStockValue('');
      await loadProducts();
      alert('선택한 상품에 작업이 적용되었습니다.');
    } catch (updateError) {
      console.error('관리자 상품 일괄 수정 오류:', updateError);
      setError('일괄 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPrice = (product) => {
    const original = product.originalPrice ?? product.price;
    const discounted = original > product.price;
    if (!discounted) {
      return <span className="admin-price-current">{product.price.toLocaleString()}원</span>;
    }

    return (
      <div className="admin-price-stack">
        <span className="admin-price-original">{original.toLocaleString()}원</span>
        <span className="admin-price-current">{product.price.toLocaleString()}원</span>
      </div>
    );
  };

  const renderDiscount = (product) => {
    const original = product.originalPrice ?? product.price;
    if (original <= product.price) {
      return '-';
    }
    const percent = product.discountPercent || Math.round((1 - (product.price / original)) * 100);
    return <span className="admin-discount-badge">-{percent}%</span>;
  };

  const renderStock = (product) => (
    product.stock === 0
      ? <span className="admin-stock-zero">0개 / 품절</span>
      : <span className="admin-stock-ok">{product.stock}</span>
  );

  const getStatusLabel = (product) => {
    if (product.stock === 0) {
      return '품절';
    }

    switch (product.status) {
      case 'ON_SALE':
        return '판매중';
      case 'SOLD_OUT':
        return '품절';
      case 'HIDDEN':
        return '숨김';
      default:
        return product.status || '-';
    }
  };

  if (!authChecked) {
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
    <div className="admin-form-container admin-form-wide admin-product-list-page">
      <div className="form-header">
        <h2>관리자 상품 목록</h2>
        <p>상품 검색, 카테고리 필터, 할인 상태를 한 화면에서 확인할 수 있습니다.</p>
      </div>

      <div className="admin-product-list-layout">
        <aside className="admin-category-sidebar">
          <div className="admin-sidebar-title">카테고리</div>
          <button
            type="button"
            className={`admin-category-link ${selectedCategoryId === null ? 'active' : ''}`}
            onClick={selectAllCategories}
          >
            전체 상품
          </button>

          {rootCategories.length === 0 ? (
            <p className="admin-category-empty">등록된 카테고리가 없습니다.</p>
          ) : (
            rootCategories.map((root) => {
              const children = getChildCategories(root.id);
              const hasChildren = children.length > 0;
              const isExpanded = expandedCategoryIds.includes(root.id);

              return (
                <div className="admin-category-block" key={root.id}>
                  <button
                    type="button"
                    className={`admin-category-link ${selectedCategoryId === root.id ? 'active' : ''}`}
                    onClick={() => selectCategory(root.id, hasChildren)}
                  >
                    <span>{root.name}</span>
                    <span className="admin-category-toggle-indicator" aria-hidden="true">
                      {hasChildren ? (isExpanded ? 'v' : '>') : ' '}
                    </span>
                  </button>

                  {hasChildren && isExpanded && (
                    <div className="admin-category-sublist">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          className={`admin-category-link admin-category-subitem ${selectedCategoryId === child.id ? 'active' : ''}`}
                          onClick={() => selectCategory(child.id)}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </aside>

        <section className="admin-product-main">
          <div className="admin-toolbar-panel">
            <div className="admin-search-group">
              <label className="action-label" htmlFor="admin-product-search">상품 검색</label>
              <input
                id="admin-product-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                  setSelectedIds(new Set());
                }}
                placeholder="상품 ID 또는 제품명"
              />
              <button
                type="button"
                className="btn-submit-nature btn-small btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setPage(0);
                  setSelectedIds(new Set());
                }}
                disabled={!searchQuery}
              >
                초기화
              </button>
            </div>

            <div className="admin-action-bar">
              <div className="action-group">
                <label className="action-label">원가 수정</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="원가"
                  min="0"
                />
                <button
                  type="button"
                  className="btn-submit-nature btn-small"
                  onClick={() => handleBulkAction('original_price')}
                  disabled={isSubmitting}
                >
                  원가 변경
                </button>
              </div>
              <div className="action-group">
                <label className="action-label">재고 변경</label>
                <input
                  type="number"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  placeholder="재고"
                  min="0"
                />
                <button
                  type="button"
                  className="btn-submit-nature btn-small"
                  onClick={() => handleBulkAction('stock')}
                  disabled={isSubmitting}
                >
                  재고 변경
                </button>
              </div>
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
                >
                  할인 적용
                </button>
                <button
                  type="button"
                  className="btn-submit-nature btn-small btn-secondary"
                  onClick={() => handleBulkAction('discount_cancel')}
                  disabled={isSubmitting}
                >
                  할인 취소
                </button>
              </div>
              <div className="action-group">
                <button
                  type="button"
                  className="btn-submit-nature btn-small"
                  onClick={() => handleBulkAction('sold_out')}
                  disabled={isSubmitting}
                >
                  품절 처리
                </button>
                <button
                  type="button"
                  className="btn-submit-nature btn-small btn-secondary"
                  onClick={() => handleBulkAction('sold_out_restore')}
                  disabled={isSubmitting}
                >
                  품절 취소
                </button>
                <button
                  type="button"
                  className="btn-submit-nature btn-small btn-secondary"
                  onClick={() => handleBulkAction('hide')}
                  disabled={isSubmitting}
                >
                  숨김 처리
                </button>
                <button
                  type="button"
                  className="btn-submit-nature btn-small btn-secondary"
                  onClick={() => handleBulkAction('hidden_restore')}
                  disabled={isSubmitting}
                >
                  숨김 취소
                </button>
              </div>
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
                      checked={currentProducts.length > 0 && currentProducts.every((product) => selectedIds.has(product.productId))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>ID</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>할인율</th>
                  <th>재고</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="table-loading">상품 목록을 불러오는 중입니다...</td>
                  </tr>
                ) : currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="table-empty">검색 결과가 없습니다.</td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr key={product.productId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.productId)}
                          onChange={() => toggleSelect(product.productId)}
                        />
                      </td>
                      <td>{product.productId}</td>
                      <td>
                        <div className="admin-product-name-cell">
                          <span>{product.name}</span>
                          {product.discountPercent > 0 && <span className="admin-discount-inline">할인중</span>}
                        </div>
                      </td>
                      <td>{product.category || '-'}</td>
                      <td>{renderPrice(product)}</td>
                      <td>{renderDiscount(product)}</td>
                      <td>{renderStock(product)}</td>
                      <td>{getStatusLabel(product)}</td>
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
              disabled={safePage === 0 || isLoading}
            >
              이전
            </button>
            <span>페이지 {safePage + 1} / {totalPages}</span>
            <button
              type="button"
              className="btn-submit-nature btn-small btn-secondary"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={isLoading || safePage + 1 >= totalPages}
            >
              다음
            </button>
          </div>

          <p className="admin-footnote">선택된 상품: {displayedCount}개 / 검색 결과: {filteredProducts.length}개</p>
        </section>
      </div>
    </div>
  );
}

export default AdminProductList;
