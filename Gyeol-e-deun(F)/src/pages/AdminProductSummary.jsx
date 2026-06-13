import { useEffect, useMemo, useState } from 'react';
import { api, apiClient, authHeaders, getAccessToken } from '../utils/api';
import '../css/admin-shell.css';

const SUMMARY_SECTIONS = [
  { key: 'topSellingProducts', title: '판매량 높은 상품', unit: '개' },
  { key: 'topSearchedProducts', title: '검색량 높은 상품', unit: '회' },
  { key: 'topViewedProducts', title: '조회가 가장 많은 상품', unit: '회' },
  { key: 'salesIncreaseProducts', title: '전월대비 판매량 증가', unit: '개', showChange: true },
  { key: 'salesDecreaseProducts', title: '전월대비 판매량 감소', unit: '개', showChange: true },
];

function formatChange(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function AdminProductSummary() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    apiClient.get(api.admin.productSummary, { headers: authHeaders(token) })
      .then((response) => setSummary(response.data))
      .catch((loadError) => {
        console.error('상품요약 조회 실패:', loadError);
        setError('상품요약 데이터를 불러오지 못했습니다.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const totalCards = useMemo(() => {
    if (!summary) return [];
    return [
      { label: '판매 통계 상품', value: summary.topSellingProducts?.length || 0 },
      { label: '검색 통계 상품', value: summary.topSearchedProducts?.length || 0 },
      { label: '조회 통계 상품', value: summary.topViewedProducts?.length || 0 },
      { label: '증감 분석 상품', value: (summary.salesIncreaseProducts?.length || 0) + (summary.salesDecreaseProducts?.length || 0) },
    ];
  }, [summary]);

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-header">
        <h2>상품요약</h2>
        <p>판매량, 검색량, 조회수, 전월대비 판매량 증감 기준으로 상품 성과를 확인합니다.</p>
      </div>

      {isLoading && <p className="admin-empty-state">상품요약 데이터를 불러오는 중입니다.</p>}
      {error && <p className="admin-inline-message error">{error}</p>}

      {!isLoading && !error && summary && (
        <>
          <div className="admin-summary-grid">
            {totalCards.map((item) => (
              <div key={item.label} className="admin-summary-card">
                <span>{item.label}</span>
                <strong>{item.value.toLocaleString()}개</strong>
              </div>
            ))}
          </div>

          <div className="admin-product-summary-grid">
            {SUMMARY_SECTIONS.map((section) => {
              const rows = summary[section.key] || [];
              return (
                <section key={section.key} className="admin-table-card admin-product-summary-card">
                  <h3>{section.title}</h3>
                  {rows.length === 0 ? (
                    <p className="admin-empty-state">아직 집계된 데이터가 없습니다.</p>
                  ) : (
                    <table className="admin-inline-table">
                      <thead>
                        <tr>
                          <th>순위</th>
                          <th>상품명</th>
                          <th>현재</th>
                          {section.showChange && <th>전월</th>}
                          {section.showChange && <th>증감률</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={`${section.key}-${row.productId}`}>
                            <td>{index + 1}</td>
                            <td>{row.productName}</td>
                            <td>{Number(row.value || 0).toLocaleString()}{section.unit}</td>
                            {section.showChange && <td>{Number(row.previousValue || 0).toLocaleString()}{section.unit}</td>}
                            {section.showChange && (
                              <td className={row.changeRate >= 0 ? 'admin-stat-positive' : 'admin-stat-negative'}>
                                {formatChange(row.changeRate || 0)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminProductSummary;
