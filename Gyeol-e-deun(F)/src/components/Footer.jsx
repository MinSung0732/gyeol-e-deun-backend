import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/footer.css';

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToAbout = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#about');
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-top-links">
          <a href="/terms" className="footer-link">이용약관</a>
          <a href="/privacy" className="footer-link highlight">개인정보처리방침</a>
          <a href="/#about" className="footer-link" onClick={goToAbout}>회사소개</a>
        </div>
        
        <div className="footer-content">
          <div className="footer-cs-section">
            <h3 className="footer-brand">결이든</h3>
            <div className="cs-number">1588-0000</div>
            <p className="cs-hours">
              평일 09:00 - 18:00 (점심시간 12:00 - 13:00)<br />
              주말 및 공휴일 휴무
            </p>
            <p className="cs-email">cs@gyeol-e-deun.com</p>
          </div>

          <div className="footer-info-section">
            <p className="info-text">
              상호명 : (주)결이든 | 대표자 : 홍길동<br />
              사업자등록번호 : 123-45-67890<br />
              통신판매업신고번호 : 제 2026-서울강남-0000호<br />
              주소 : 서울특별시 강남구 테헤란로 123, 4층 결이든
            </p>
            <p className="copyright">
              © {new Date().getFullYear()} Gyeol-e-deun. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
