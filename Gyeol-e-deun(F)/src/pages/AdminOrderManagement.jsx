import '../css/admin-shell.css';

const ORDER_SUMMARY = [
  { label: '오늘 주문', value: '24건' },
  { label: '배송 대기', value: '8건' },
  { label: '출고 완료', value: '15건' },
  { label: '반품/교환', value: '1건' },
];

const ORDER_ROWS = [
  { id: 'A-1024', customer: '김하나', status: '결제 완료', shipping: '배송 준비중', date: '2026-06-13' },
  { id: 'A-1023', customer: '이도윤', status: '배송중', shipping: '택배사 인계', date: '2026-06-13' },
  { id: 'A-1022', customer: '박서준', status: '주문 취소', shipping: '취소 완료', date: '2026-06-12' },
];

function AdminOrderManagement() {
  return (
    <div className="admin-panel-page">
      <div className="admin-panel-header">
        <h2>주문 및 배송 관리</h2>
        <p>주문 상태와 배송 진행을 한곳에서 확인할 수 있습니다.</p>
      </div>

      <div className="admin-summary-grid">
        {ORDER_SUMMARY.map((item) => (
          <div key={item.label} className="admin-summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-table-card">
        <table className="admin-inline-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>고객명</th>
              <th>주문 상태</th>
              <th>배송 상태</th>
              <th>주문일</th>
            </tr>
          </thead>
          <tbody>
            {ORDER_ROWS.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.customer}</td>
                <td>{row.status}</td>
                <td>{row.shipping}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrderManagement;
