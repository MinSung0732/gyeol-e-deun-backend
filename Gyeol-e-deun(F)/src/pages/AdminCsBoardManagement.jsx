import '../css/admin-shell.css';

const CS_SUMMARY = [
  { label: '미답변 문의', value: '7건' },
  { label: '오늘 등록 리뷰', value: '18건' },
  { label: '처리 지연', value: '2건' },
  { label: '신고 리뷰', value: '1건' },
];

const CS_ROWS = [
  { id: 'Q-2048', type: '상품 문의', title: '분갈이 흙 추천 문의', status: '답변 대기', author: '김하나', date: '2026-06-13' },
  { id: 'R-3041', type: '리뷰', title: '배송 상태가 좋았어요', status: '게시중', author: '이도윤', date: '2026-06-13' },
  { id: 'Q-2047', type: '배송 문의', title: '배송 일정 확인 요청', status: '처리중', author: '박서준', date: '2026-06-12' },
  { id: 'R-3040', type: '리뷰', title: '상품 사진과 달라요', status: '확인 필요', author: '최민지', date: '2026-06-12' },
];

function AdminCsBoardManagement() {
  return (
    <div className="admin-panel-page">
      <div className="admin-panel-header">
        <h2>CS 및 게시판 관리</h2>
        <p>고객 문의와 리뷰 게시물을 모아서 확인하고 처리합니다.</p>
      </div>

      <div className="admin-summary-grid">
        {CS_SUMMARY.map((item) => (
          <div key={item.label} className="admin-summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <h3>최근 리뷰 및 문의</h3>
          <select defaultValue="all">
            <option value="all">전체</option>
            <option value="question">문의</option>
            <option value="review">리뷰</option>
          </select>
        </div>
        <table className="admin-inline-table">
          <thead>
            <tr>
              <th>게시물 ID</th>
              <th>구분</th>
              <th>제목</th>
              <th>상태</th>
              <th>작성자</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {CS_ROWS.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.type}</td>
                <td>{row.title}</td>
                <td>{row.status}</td>
                <td>{row.author}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCsBoardManagement;
