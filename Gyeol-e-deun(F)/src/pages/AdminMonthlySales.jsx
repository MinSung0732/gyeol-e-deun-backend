import { Link } from 'react-router-dom';
import '../css/admin-dashboard.css';

const DAILY_SALES = [
  { date: '2026-06-01', orders: 8, sales: 210000, refund: 0, memo: '월초 프로모션 시작' },
  { date: '2026-06-02', orders: 12, sales: 320000, refund: 20000, memo: '키트 상품 판매 증가' },
  { date: '2026-06-03', orders: 9, sales: 280000, refund: 0, memo: '일반 주문 중심' },
  { date: '2026-06-04', orders: 15, sales: 430000, refund: 15000, memo: '앰플 세트 판매' },
  { date: '2026-06-05', orders: 18, sales: 510000, refund: 0, memo: '주간 최고 매출' },
  { date: '2026-06-06', orders: 13, sales: 380000, refund: 30000, memo: '교환 1건 발생' },
  { date: '2026-06-07', orders: 16, sales: 460000, refund: 0, memo: '재구매 고객 유입' },
];

function formatWon(value) {
  return `${Number(value || 0).toLocaleString()}원`;
}

function AdminMonthlySales() {
  const totalSales = DAILY_SALES.reduce((sum, row) => sum + row.sales, 0);
  const totalOrders = DAILY_SALES.reduce((sum, row) => sum + row.orders, 0);
  const totalRefund = DAILY_SALES.reduce((sum, row) => sum + row.refund, 0);

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>당월 일별 매출내역</h2>
          <p className="dashboard-subtitle">2026년 6월 일별 주문, 매출, 환불 금액을 정리했습니다.</p>
        </div>
        <Link to="/admin/dashboard" className="dashboard-back-link">대시보드로 돌아가기</Link>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>당월 누적 매출</h3>
          <p className="amount text-blue">{formatWon(totalSales)}</p>
          <span className="trend positive">집계 기준: 결제 완료</span>
        </div>
        <div className="card">
          <h3>당월 주문 수</h3>
          <p className="amount">{totalOrders.toLocaleString()}건</p>
          <span className="trend positive">일평균 {Math.round(totalOrders / DAILY_SALES.length)}건</span>
        </div>
        <div className="card">
          <h3>당월 환불</h3>
          <p className="amount text-red">{formatWon(totalRefund)}</p>
          <span className="trend negative">매출 대비 {((totalRefund / totalSales) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="chart-card">
        <h3>일별 매출 상세</h3>
        <table className="transaction-table monthly-sales-table">
          <thead>
            <tr>
              <th>일자</th>
              <th>주문 수</th>
              <th>매출</th>
              <th>환불</th>
              <th>순매출</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_SALES.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.orders}건</td>
                <td className="text-blue">{formatWon(row.sales)}</td>
                <td className="text-red">{formatWon(row.refund)}</td>
                <td>{formatWon(row.sales - row.refund)}</td>
                <td>{row.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminMonthlySales;
