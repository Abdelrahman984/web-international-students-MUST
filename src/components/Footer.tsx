import React from 'react';
import './Footer.scss';

interface FooterProps {
  darkMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`must-footer ${darkMode ? 'dark' : ''}`}>
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Column 1: Links */}
          <div className="footer-column">
            <h3 className="footer-title">Links</h3>
            <ul className="footer-links">
              <li><a href="https://must.edu.eg/undergraduate-admission/" target="_blank" rel="noopener noreferrer">Undergraduate</a></li>
              <li><a href="https://must.edu.eg/post-graduate-admission/" target="_blank" rel="noopener noreferrer">Postgraduate</a></li>
              <li><a href="https://must.edu.eg/apply-now/" target="_blank" rel="noopener noreferrer">Apply Online</a></li>
              <li><a href="https://must.edu.eg/faculties/" target="_blank" rel="noopener noreferrer">Faculties</a></li>
              <li><a href="https://must.edu.eg/academic-calendar/" target="_blank" rel="noopener noreferrer">Academic Calendar</a></li>
            </ul>
          </div>

          {/* Column 2: About University */}
          <div className="footer-column">
            <h3 className="footer-title">About University</h3>
            <ul className="footer-links">
              <li><a href="https://must.edu.eg/presidents-office/" target="_blank" rel="noopener noreferrer">President</a></li>
              <li><a href="https://must.edu.eg/vice-presidents/" target="_blank" rel="noopener noreferrer">Vice Presidents</a></li>
              <li><a href="https://must.edu.eg/board-of-trustees/" target="_blank" rel="noopener noreferrer">Board of Trustees</a></li>
              <li><a href="https://must.edu.eg/about-must/vision-mission/" target="_blank" rel="noopener noreferrer">Vision & Mission</a></li>
              <li><a href="https://must.edu.eg/about-must/must-policies/" target="_blank" rel="noopener noreferrer">MUST Values & Principles</a></li>
              <li><a href="https://must.edu.eg/history/" target="_blank" rel="noopener noreferrer">History</a></li>
            </ul>
          </div>

          {/* Column 3: MUST Buzz */}
          <div className="footer-column">
            <h3 className="footer-title">MUST BUZZ</h3>
            <ul className="footer-links">
              <li><a href="https://must.edu.eg/news/" target="_blank" rel="noopener noreferrer">News</a></li>
              <li><a href="https://must.edu.eg/events/" target="_blank" rel="noopener noreferrer">Events</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="footer-column contact-col">
            <h3 className="footer-title">Contact Info</h3>
            <div className="contact-details">
              <p className="address">
                <i className="fas fa-map-marker-alt"></i>
                Al-Motamayez District, 6th of October City, Giza, Egypt
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
            <p className="copyright">© 2025 Misr University for Science and Technology. All Rights Reserved.</p>
            <div className="bottom-links">
              <a href="https://must.edu.eg/privacy-policy/" target="_blank" rel="noopener noreferrer">Policy</a>
              <span className="separator">|</span>
              <a href="https://must.edu.eg/contact/" target="_blank" rel="noopener noreferrer">Contact Us</a>
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