import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  darkMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  const { t } = useLanguage();

  return (
    <footer className={`must-footer ${darkMode ? 'dark' : ''}`}>
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Column 1: Links */}
          <div className="footer-column">
            <h3 className="footer-title">{t('footer_links')}</h3>
            <ul className="footer-links">
              <li><Link to="/undergraduate">{t('undergraduate_studies')}</Link></li>
              <li><Link to="/postgraduate">{t('postgraduate_programs')}</Link></li>
              <li><Link to="/how-to-apply">{t('apply_online')}</Link></li>
              <li><Link to="/educational-programs">{t('faculties')}</Link></li>
              <li><Link to="/calendar">{t('academic_calendar')}</Link></li>
            </ul>
          </div>

          {/* Column 2: About University */}
          <div className="footer-column">
            <h3 className="footer-title">{t('footer_about_uni')}</h3>
            <ul className="footer-links">
              <li><a href="https://must.edu.eg/presidents-office/" target="_blank" rel="noopener noreferrer">{t('president')}</a></li>
              <li><a href="https://must.edu.eg/vice-presidents/" target="_blank" rel="noopener noreferrer">{t('vice_presidents')}</a></li>
              <li><a href="https://must.edu.eg/board-of-trustees/" target="_blank" rel="noopener noreferrer">{t('board_of_trustees')}</a></li>
              <li><a href="https://must.edu.eg/about-must/vision-mission/" target="_blank" rel="noopener noreferrer">{t('vision_mission')}</a></li>
              <li><a href="https://must.edu.eg/about-must/must-policies/" target="_blank" rel="noopener noreferrer">{t('must_values')}</a></li>
              <li><a href="https://must.edu.eg/history/" target="_blank" rel="noopener noreferrer">{t('history')}</a></li>
            </ul>
          </div>

          {/* Column 3: MUST Buzz */}
          <div className="footer-column">
            <h3 className="footer-title">{t('footer_must_buzz')}</h3>
            <ul className="footer-links">
              <li><Link to="/news">{t('news')}</Link></li>
              <li><Link to="/events">{t('events')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="footer-column contact-col">
            <h3 className="footer-title">{t('footer_contact_info')}</h3>
            <div className="contact-details">
              <p className="address">
                <i className="fas fa-map-marker-alt"></i>
                {t('footer_address')}
              </p>
              <p className="phone">
                <i className="fas fa-phone"></i>
                16878
              </p>
              <p className="email">
                <i className="fas fa-envelope"></i>
                info@must.edu.eg
              </p>
              
              <div className="social-links">
                <a href="https://www.facebook.com/mustuni" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="https://twitter.com/must_uni" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fab fa-twitter"></i></a>
                <a href="https://www.instagram.com/must_uni" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.linkedin.com/school/mustuni/" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://www.youtube.com/user/mustuniversity" target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="bottom-content">
            <p className="copyright">{t('footer_copyright')}</p>
            <div className="bottom-links">
              <a href="https://must.edu.eg/privacy-policy/" target="_blank" rel="noopener noreferrer">{t('footer_policy')}</a>
              <span className="separator">|</span>
              <Link to="/contactus">{t('contact_us')}</Link>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative Wave/Pattern */}
      <div className="footer-decoration">
        <div className="wave"></div>
      </div>
    </footer>
  );
};
