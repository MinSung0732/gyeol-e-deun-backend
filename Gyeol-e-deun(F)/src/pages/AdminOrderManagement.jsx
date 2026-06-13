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
  { id: 'A-1021', customer: '최민지', status: '상품 준비', shipping: '포장 대기', date: '2026-06-12' },
];

const DELIVERY_STEPS = [
  { label: '결제 확인', count: 6 },
  { label: '상품 준비', count: 11 },
  { label: '포장 완료', count: 5 },
  { label: '택배 인계', count: 9 },
];

const WORK_QUEUE = [
  { title: '송장번호 입력 필요', description: '포장 완료 주문 5건의 송장번호가 비어 있습니다.' },
  { title: '취소 요청 확인', description: '결제 완료 상태의 취소 요청 2건을 검토해야 합니다.' },
  { title: '배송 지연 안내', description: '주문 후 2일 이상 배송 대기 중인 주문이 3건 있습니다.' },
];

function AdminOrderManagement() {
  return (
    <div className="admin-panel-page">
      <div className="admin-panel-header">
        <h2>주문 및 배송 관리</h2>
        <p>주문 상태와 배송 진행 상황을 한 화면에서 확인합니다.</p>
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
        <div className="admin-table-toolbar">
          <h3>최근 주문</h3>
          <select defaultValue="all" aria-label="주문 상태 필터">
            <option value="all">전체 상태</option>
            <option value="paid">결제 완료</option>
            <option value="shipping">배송중</option>
            <option value="cancelled">취소/반품</option>
          </select>
        </div>
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

      <div className="admin-order-grid">
        <section className="admin-table-card admin-order-panel">
          <h3>배송 단계별 현황</h3>
          <div className="admin-delivery-steps">
            {DELIVERY_STEPS.map((step) => (
              <div key={step.label} className="admin-delivery-step">
                <span>{step.label}</span>
                <strong>{step.count}건</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-table-card admin-order-panel">
          <h3>처리 대기 작업</h3>
          <div className="admin-work-queue">
            {WORK_QUEUE.map((item) => (
              <article key={item.title} className="admin-work-item">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminOrderManagement;
