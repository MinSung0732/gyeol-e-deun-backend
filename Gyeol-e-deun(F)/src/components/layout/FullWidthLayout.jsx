import { Outlet } from 'react-router-dom';
import '../../css/layout.css';

function FullWidthLayout({ children, className = '' }) {
  return (
    <div className={`layout-full-page ${className}`.trim()}>
      {children || <Outlet />}
    </div>
  );
}

export default FullWidthLayout;
