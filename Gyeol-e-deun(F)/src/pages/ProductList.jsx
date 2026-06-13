import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, api, authHeaders, getAccessToken } from '../utils/api';
import { addToCart } from '../utils/cart';
import { getPrimaryThumbnail } from '../utils/productImages';
import '../css/main.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expandedMajors, setExpandedMajors] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gridLayout, setGridLayout] = useState('5x5');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = useMemo(() => {
    if (gridLayout === '4x4') return 16;
    if (gridLayout === '4x5') return 20;
    return 25;
  }, [gridLayout]);

  const gridColumns = useMemo(() => (gridLayout === '5x5' ? 5 : 4), [gridLayout]);

  useEffect(() => {
    apiClient.get(api.products.list)
      .then((response) => {
        setProducts(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('상품 목록 로드 실패:', error);
        setIsLoading(false);
      });

    apiClient.get(api.categories.list)
      .then((response) => setCategories(response.data))
      .catch((error) => {
        console.error('카테고리 조회 실패:', error);
        setCategories([]);
      });

    const token = getAccessToken();
    if (token) {
      apiClient.get(api.wishlist.list, { headers: authHeaders(token) })
        .then((response) => {
          setWishlist(response.data.map((item) => item.productId));
        })
        .catch((error) => console.error('위시리스트 조회 실패:', error));
    }
  }, []);

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

  const getPricing = (product) => {
    const originalPrice = product.originalPrice ?? product.price;
    const isDiscounted = originalPrice > product.price;
    return {
      originalPrice,
      currentPrice: product.price,
      isDiscounted,
      discountPercent: product.discountPercent,
    };
  };

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products.filter((product) => product.status !== 'HIDDEN');
    }
    return products.filter(
      (product) => product.status !== 'HIDDEN' && categoryMatches(product.category, selectedCategory),
    );
  }, [products, selectedCategory]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [selectedCategoryId, gridLayout]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      await apiClient.post(api.wishlist.toggle(productId), {}, { headers: authHeaders(token) });
      setWishlist((prev) => (
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      ));
    } catch (error) {
      console.error('위시리스트 처리 실패:', error);
      alert('위시리스트 처리 중 오류가 발생했습니다.');
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const message = await addToCart({ productId: product.productId, count: 1 }, token);
      alert(message || '장바구니에 담았습니다.');
    } catch (err) {
      console.error('장바구니 추가 실패:', err);
      alert(typeof err.response?.data === 'string' ? err.response.data : '장바구니 추가에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div className="loading-text">상품을 불러오는 중입니다...</div>;
  }

  return (
    <main className="main-container product-list-page">
      <section className="page-banner">
        <span className="page-banner-tag">Healthy Choices</span>
        <h2>자연을 담은 건강한 선택, 결이든</h2>
        <p>우리 가족이 안심하고 사용할 수 있는 바른 상품들을 만나보세요.</p>
      </section>

      <section className="product-section product-layout">
        <aside className="category-sidebar">
          <h4>카테고리</h4>
          <button
            type="button"
            className={`category-link ${selectedCategoryId === null ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategoryId(null);
              setExpandedMajors([]);
            }}
          >
            전체보기
          </button>

          {rootCategories.length === 0 ? (
            <p className="empty-category-text">카테고리가 아직 등록되지 않았습니다.</p>
          ) : (
            rootCategories.map((root) => {
              const children = getChildCategories(root.id);
              const hasChildren = children.length > 0;
              const isExpanded = expandedMajors.includes(root.id);

              return (
                <div className="category-block" key={root.id}>
                  <button
                    type="button"
                    className={`category-link ${selectedCategoryId === root.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategoryId(root.id);
                      if (hasChildren) {
                        setExpandedMajors((prev) => (
                          prev.includes(root.id)
                            ? prev.filter((id) => id !== root.id)
                            : [...prev, root.id]
                        ));
                      } else {
                        setExpandedMajors((prev) => prev.filter((id) => id !== root.id));
                      }
                    }}
                  >
                    {root.name}
                    {hasChildren && (
                      <span className={`chevron ${isExpanded ? 'open' : ''}`} style={{ marginLeft: 8 }}>
                        {isExpanded ? 'v' : '>'}
                      </span>
                    )}
                  </button>

                  {hasChildren && isExpanded && (
                    <div className="category-sublist">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          className={`category-link subcategory ${selectedCategoryId === child.id ? 'active' : ''}`}
                          onClick={() => setSelectedCategoryId(child.id)}
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

        <div className="product-content">
          <div className="product-section-header">
            <div className="header-left">
              <h3>추천 상품</h3>
              {selectedCategory && (
                <p className="selected-category-label">
                  {selectedCategory.parentName ? `${selectedCategory.parentName} > ${selectedCategory.name}` : selectedCategory.name}
                  {' '}
                  선택중
                </p>
              )}
            </div>
            <div className="layout-controls">
              <button
                className={`layout-btn ${gridLayout === '4x4' ? 'active' : ''}`}
                onClick={() => setGridLayout('4x4')}
                title="4x4 배열 (16개)"
              >
                4x4
              </button>
              <button
                className={`layout-btn ${gridLayout === '4x5' ? 'active' : ''}`}
                onClick={() => setGridLayout('4x5')}
                title="4x5 배열 (20개)"
              >
                4x5
              </button>
              <button
                className={`layout-btn ${gridLayout === '5x5' ? 'active' : ''}`}
                onClick={() => setGridLayout('5x5')}
                title="5x5 배열 (25개)"
              >
                5x5
              </button>
            </div>
          </div>

          <div className="layout-controls-divider"></div>

          {filteredProducts.length === 0 ? (
            <p className="no-product">선택한 카테고리의 상품이 없습니다. 다른 카테고리를 선택해 주세요.</p>
          ) : (
            <>
              <div className="product-grid" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
                {currentProducts.map((product) => {
                  const pricing = getPricing(product);
                  return (
                    <div
                      className="product-card"
                      key={product.productId}
                      onClick={() => navigate(`/products/${product.productId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="thumbnail-box">
                        <img src={getPrimaryThumbnail(product)} alt={product.name} />
                        <button
                          type="button"
                          className="btn-wishlist"
                          onClick={(e) => handleToggleWishlist(e, product.productId)}
                          title={wishlist.includes(product.productId) ? '위시리스트 해제' : '위시리스트 추가'}
                        >
                          {wishlist.includes(product.productId) ? '♥' : '♡'}
                        </button>
                        {product.status === 'SOLD_OUT' && <span className="badge sold-out">품절</span>}
                        {pricing.isDiscounted && pricing.discountPercent && (
                          <span className="badge discount">-{pricing.discountPercent}%</span>
                        )}
                      </div>

                      <div className="product-info">
                        {product.category && <span className="product-category">{product.category}</span>}
                        <h4 className="product-name">{product.name}</h4>
                        <p className="product-desc">{product.description}</p>
                        <div className="product-bottom">
                          <div className="product-price-wrap">
                            {pricing.isDiscounted ? (
                              <>
                                <span className="price-original">{pricing.originalPrice.toLocaleString()}원</span>
                                <span className="product-price price-sale">{pricing.currentPrice.toLocaleString()}원</span>
                              </>
                            ) : (
                              <span className="product-price">{pricing.currentPrice.toLocaleString()}원</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn-cart"
                            disabled={product.status === 'SOLD_OUT' || product.stock <= 0}
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            담기
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pagination-block">
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                >
                  다음
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default ProductList;
