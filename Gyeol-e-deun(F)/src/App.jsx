import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './css/index.css';
import './css/layout.css';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import AdminProductAdd from './pages/AdminProductAdd';
import AdminProductList from './pages/AdminProductList';
import AdminProductSummary from './pages/AdminProductSummary';
import AdminDashboard from './pages/AdminDashboard';
import AdminMonthlySales from './pages/AdminMonthlySales';
import AdminOrderManagement from './pages/AdminOrderManagement';
import AdminCustomerCrm from './pages/AdminCustomerCrm';
import AdminCsBoardManagement from './pages/AdminCsBoardManagement';
import ProductDetail from './pages/ProductDetail';
import MyPage from './pages/MyPage';
import Cart from './pages/Cart';
import FullWidthLayout from './components/layout/FullWidthLayout';
import BoxedLayout from './components/layout/BoxedLayout';
import CenteredBoxedLayout from './components/layout/CenteredBoxedLayout';
import AdminShell from './components/layout/AdminShell';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      {!isAdminRoute && <Header />}
      <main className="app-main">
        <Routes>
          <Route element={<FullWidthLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route element={<CenteredBoxedLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="dashboard/monthly-sales" element={<AdminMonthlySales />} />
            <Route path="orders" element={<AdminOrderManagement />} />
            <Route path="customers" element={<AdminCustomerCrm />} />
            <Route path="cs-board" element={<AdminCsBoardManagement />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/add" element={<AdminProductAdd />} />
            <Route path="products/summary" element={<AdminProductSummary />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route element={<BoxedLayout />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
