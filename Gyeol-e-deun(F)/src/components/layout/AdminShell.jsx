import { Link, NavLink, Outlet } from 'react-router-dom';
import '../../css/admin-shell.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: '대시보드 요약', description: '운영 현황과 핵심 지표' },
  { to: '/admin/orders', label: '주문 및 배송 관리', description: '주문 처리와 배송 상태' },
  { to: '/admin/products', label: '상품 관리', description: '목록, 검색, 할인, 재고' },
  { to: '/admin/products/add', label: '상품 등록', description: '새 상품 추가' },
];

function AdminShell() {
  return (
    <div className="admin-shell">
      <aside className="admin-shell-sidebar">
        <div className="admin-shell-brand">
          <span className="admin-shell-brand-kicker">Admin Studio</span>
          <h1>관리자 운영실</h1>
          <p>관리자 전용 작업 공간</p>
        </div>

        <nav className="admin-shell-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/products'}
              className={({ isActive }) => `admin-shell-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="admin-shell-nav-label">{item.label}</span>
              <span className="admin-shell-nav-desc">{item.description}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-shell-footer">
          <Link to="/" className="admin-shell-home-link">메인 페이지로 이동</Link>
          <small>상품, 주문, 배송을 한 화면에서 관리합니다.</small>
        </div>
      </aside>

      <main className="admin-shell-content">
        <div className="admin-shell-topbar">
          <div>
            <span className="admin-shell-topbar-kicker">Admin Dashboard</span>
            <h2>관리자 대시보드</h2>
          </div>
          <Link to="/" className="admin-shell-home-link">메인 페이지로 이동</Link>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminShell;
