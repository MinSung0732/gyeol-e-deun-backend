import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, apiClient, authHeaders, getAccessToken } from '../../utils/api';
import '../../css/admin-shell.css';

const MEMBER_NAV_ITEMS = [
  { to: '/admin/customers', label: '고객 회원관리', description: '회원 상세, 혜택, 블랙리스트' },
  { to: '/admin/orders', label: '주문 및 배송관리', description: '주문 처리와 배송 상태' },
  { to: '/admin/cs-board', label: '게시판관리', description: '리뷰와 문의 응대' },
];

const PRODUCT_NAV_ITEMS = [
  { to: '/admin/products', label: '상품관리', description: '목록, 검색, 할인, 재고' },
  { to: '/admin/products/add', label: '상품등록', description: '새 상품 추가' },
  { to: '/admin/products/summary', label: '상품요약', description: '요약 페이지 준비중' },
];

function AdminNavLink({ item, end }) {
  return (
    <NavLink
      to={item.to}
      end={end}
      className={({ isActive }) => `admin-shell-nav-item ${isActive ? 'active' : ''}`}
    >
      <span className="admin-shell-nav-label">{item.label}</span>
      <span className="admin-shell-nav-desc">{item.description}</span>
    </NavLink>
  );
}

function AdminNavGroup({ title, isOpen, onToggle, children }) {
  return (
    <div className="admin-shell-nav-group">
      <button
        type="button"
        className="admin-shell-group-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <b>{isOpen ? '접기' : '펼치기'}</b>
      </button>
      {isOpen && <div className="admin-shell-group-items">{children}</div>}
    </div>
  );
}

function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [memberOpen, setMemberOpen] = useState(
    ['/admin/customers', '/admin/orders', '/admin/cs-board'].some((path) => location.pathname.startsWith(path)),
  );
  const [productOpen, setProductOpen] = useState(location.pathname.startsWith('/admin/products'));

  useEffect(() => {
    let ignore = false;
    const token = getAccessToken();

    if (!token) {
      navigate('/', { replace: true });
      return () => {
        ignore = true;
      };
    }

    apiClient.get(api.members.me, { headers: authHeaders(token) })
      .then((response) => {
        if (ignore) return;
        if (response.data?.role === 'ROLE_ADMIN') {
          setAuthorized(true);
          setCheckingAuth(false);
          return;
        }
        localStorage.removeItem('accessToken');
        navigate('/', { replace: true });
      })
      .catch(() => {
        if (ignore) return;
        localStorage.removeItem('accessToken');
        navigate('/', { replace: true });
      });

    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (checkingAuth || !authorized) {
    return <div className="admin-auth-checking">관리자 권한을 확인하는 중입니다.</div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-shell-sidebar">
        <div className="admin-shell-brand">
          <span className="admin-shell-brand-kicker">Admin Studio</span>
          <h1>관리자 운영실</h1>
          <p>관리자 전용 작업 공간</p>
        </div>

        <nav className="admin-shell-nav">
          <AdminNavLink
            item={{ to: '/admin/dashboard', label: '대시보드 요약', description: '운영 현황과 핵심 지표' }}
          />

          <AdminNavGroup title="회원관리" isOpen={memberOpen} onToggle={() => setMemberOpen((prev) => !prev)}>
            {MEMBER_NAV_ITEMS.map((item) => (
              <AdminNavLink key={item.to} item={item} />
            ))}
          </AdminNavGroup>

          <AdminNavGroup title="상품관리" isOpen={productOpen} onToggle={() => setProductOpen((prev) => !prev)}>
            {PRODUCT_NAV_ITEMS.map((item) => (
              <AdminNavLink key={item.to} item={item} end={item.to === '/admin/products'} />
            ))}
          </AdminNavGroup>
        </nav>

        <div className="admin-shell-footer">
          <Link to="/" className="admin-shell-home-link">메인 페이지로 이동</Link>
          <small>상품, 주문, 고객 대응을 한 화면에서 관리합니다.</small>
        </div>
      </aside>

      <main className="admin-shell-content">
        <div className="admin-shell-topbar">
          <div>
            <nav className="admin-shell-breadcrumb" aria-label="관리자 위치">
              <Link to="/">홈</Link>
              <span>/</span>
              <span>관리자</span>
            </nav>
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
