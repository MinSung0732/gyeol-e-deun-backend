import { Outlet } from 'react-router-dom';
import '../../css/layout.css';

function BoxedLayout({ children, className = '' }) {
  return (
    <div className={`layout-boxed-page ${className}`.trim()}>
      <div className="layout-boxed-inner">
        {children || <Outlet />}
      </div>
    </div>
  );
}

export default BoxedLayout;
