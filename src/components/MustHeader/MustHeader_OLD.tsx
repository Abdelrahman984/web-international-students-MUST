import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './MustHeader.scss';
import { MENU_ITEMS, MenuItem } from './navigation.data';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

export interface MustHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const MustHeader: React.FC<MustHeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  const [activeDropdown, setActiveDropdown] = useState<MenuItem | null>(null);
  const [activeLeftItem, setActiveLeftItem] = useState<MenuItem | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileActiveItem, setMobileActiveItem] = useState<MenuItem | null>(null);
  const [mobileActiveSubItem, setMobileActiveSubItem] = useState<MenuItem | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdvisor = user?.role?.type === ROLES.ADMIN;
  const strapiAdminUrl = import.meta.env.VITE_STRAPI_URL
    ? `${import.meta.env.VITE_STRAPI_URL.replace(/\/$/, '')}/admin`
    : '#';

  // Close menus on route change
  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  // Desktop hover logic
  const onMouseEnter = (item: MenuItem) => {
    if (window.innerWidth > 991) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (!activeDropdown) {
        setActiveLeftItem(null);
      }
      setActiveDropdown(item);
    }
  };

  const onMouseLeave = () => {
    if (window.innerWidth > 991) {
      hoverTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
        setActiveLeftItem(null);
      }, 150);
    }
  };

  const onLeftPanelHover = (child: MenuItem) => {
    if (window.innerWidth > 991) {
      setActiveLeftItem(child);
    }
  };

  // Mobile menu logic
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleMobileItem = (item: MenuItem, event: React.MouseEvent) => {
    event.preventDefault();
    setMobileActiveItem(mobileActiveItem === item ? null : item);
    setMobileActiveSubItem(null);
  };

  const toggleMobileSubItem = (subItem: MenuItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMobileActiveSubItem(mobileActiveSubItem === subItem ? null : subItem);
  };

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveLeftItem(null);
  };

  const toggleTheme = () => {
    onToggleDarkMode();
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate('/');
  };

  return (
    <>
      <header className="must-header">
        <div className="header-container">
          
          {/* Left Logo */}
          <Link to="/" className="logo-link" title="Home">
            <img src="/assets/1740307130_140_87669_group1000004290.svg" alt="MUST Logo" className="logo-img" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-list">
              {MENU_ITEMS.map((item, idx) => (
                <li
                  key={idx}
                  className="nav-item"
                  onMouseEnter={() => onMouseEnter(item)}
                  onMouseLeave={onMouseLeave}
                >
                  {/* Top Level Link */}
                  {item.routerLink ? (
                    <Link
                      to={item.routerLink}
                      className="nav-link"
                      onClick={closeMenus}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.externalUrl || '#'}
                      target={item.externalUrl ? '_blank' : undefined}
                      rel={item.externalUrl ? 'noopener noreferrer' : undefined}
                      className={`nav-link ${activeDropdown === item ? 'active' : ''}`}
                    >
                      {item.label}
                    </a>
                  )}

                  {/* MEGA SPLIT DROPDOWN */}
                  {item.hasMegaMenu && (
                    <div className={`mega-menu-overlay ${activeDropdown === item ? 'show' : ''}`}>
                      <div className="mega-menu-container">
                        <div className="mega-left-panel">
                          <ul className="left-panel-list">
                            {item.children?.map((child, cIdx) => (
                              <li
                                key={cIdx}
                                className="left-panel-item"
                                onMouseEnter={() => onLeftPanelHover(child)}
                              >
                                {child.routerLink ? (
                                  <Link
                                    to={child.routerLink}
                                    className="left-panel-link"
                                    onClick={closeMenus}
                                  >
                                    {child.label}
                                  </Link>
                                ) : (
                                  <a
                                    href={child.externalUrl || '#'}
                                    target={child.externalUrl ? '_blank' : undefined}
                                    rel={child.externalUrl ? 'noopener noreferrer' : undefined}
                                    className={`left-panel-link ${activeLeftItem === child ? 'active' : ''}`}
                                  >
                                    {child.label}
                                    {child.children && child.children.length > 0 && (
                                      <i className={`fas icon-chevron ${activeLeftItem === child ? 'fa-chevron-right' : 'fa-chevron-down'}`}></i>
                                    )}
                                  </a>
                                )}

                                {/* DYNAMIC RIGHT PANEL */}
                                {activeLeftItem === child && child.children && child.children.length > 0 && (
                                  <div className="mega-right-panel">
                                    <div className="right-content-wrapper">
                                      <ul className="right-panel-list">
                                        {child.children.map((subChild, sIdx) => (
                                          <li key={sIdx} className="right-panel-item">
                                            {subChild.routerLink ? (
                                              <Link
                                                to={subChild.routerLink}
                                                className="right-panel-link"
                                                onClick={closeMenus}
                                              >
                                                {subChild.label}
                                              </Link>
                                            ) : (
                                              <a
                                                href={subChild.externalUrl || '#'}
                                                target={subChild.externalUrl ? '_blank' : undefined}
                                                rel={subChild.externalUrl ? 'noopener noreferrer' : undefined}
                                                className="right-panel-link"
                                              >
                                                {subChild.label}
                                              </a>
                                            )}

                                            {/* 4th Level Deep Elements */}
                                            {subChild.children && subChild.children.length > 0 && (
                                              <ul className="deep-panel-list">
                                                {subChild.children.map((deepChild, dIdx) => (
                                                  <li key={dIdx}>
                                                    <a
                                                      href={deepChild.externalUrl || '#'}
                                                      target={deepChild.externalUrl ? '_blank' : undefined}
                                                      rel={deepChild.externalUrl ? 'noopener noreferrer' : undefined}
                                                      className="deep-panel-link"
                                                    >
                                                      {deepChild.label}
                                                    </a>
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SIMPLE VERTICAL DROPDOWN */}
                  {!item.hasMegaMenu && item.children && (
                    <div className={`simple-dropdown ${activeDropdown === item ? 'show' : ''}`}>
                      <ul className="simple-dropdown-list">
                        {item.children.map((child, scIdx) => (
                          <li key={scIdx}>
                            {child.routerLink ? (
                              <Link
                                to={child.routerLink}
                                className="simple-dropdown-link"
                                onClick={closeMenus}
                              >
                                {child.label}
                              </Link>
                            ) : (
                              <a
                                href={child.externalUrl || '#'}
                                target={child.externalUrl ? '_blank' : undefined}
                                rel={child.externalUrl ? 'noopener noreferrer' : undefined}
                                className="simple-dropdown-link"
                              >
                                {child.label}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Controls */}
          <div className="header-controls">
            <button
              className="icon-toggle"
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`fas ${!darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {isAdvisor && (
              <a
                href={strapiAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-auth login-btn ms-2"
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-gauge-high"></i>
                <span>Dashboard</span>
              </a>
            )}

            {!user ? (
              <>
                <Link to="/login" className="btn-auth login-btn ms-2" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-user-circle"></i>
                  <span>Sign In</span>
                </Link>
                <Link to="/register" className="btn-auth login-btn ms-2" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-user-plus"></i>
                  <span>Register</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="btn-auth login-btn ms-2" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-user"></i>
                  <span>{user.displayName || user.username}</span>
                </Link>
                <button className="btn-auth logout-btn ms-2" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Sign Out</span>
                </button>
              </>
            )}

            {/* Mobile Toggle */}
            <button className="mobile-toggle ms-2" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <i className={`fas ${!isMobileMenuOpen ? 'fa-bars' : 'fa-times'}`}></i>
            </button>
          </div>
          
        </div>
      </header>

      {/* Mobile Overlay Navigation */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'show' : ''}`}>
        <div className="mobile-nav-container">
          <ul className="mobile-nav-list">
            {MENU_ITEMS.map((item, mIdx) => (
              <li key={mIdx} className="mobile-nav-item">
                
                {/* No children */}
                {!item.children && (
                  item.routerLink ? (
                    <Link to={item.routerLink} className="mobile-nav-link" onClick={closeMenus}>
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.externalUrl || '#'}
                      target={item.externalUrl ? '_blank' : undefined}
                      rel={item.externalUrl ? 'noopener noreferrer' : undefined}
                      className="mobile-nav-link"
                      onClick={closeMenus}
                    >
                      {item.label}
                    </a>
                  )
                )}

                {/* Has children */}
                {item.children && (
                  <>
                    <a
                      href="#"
                      className="mobile-nav-link"
                      onClick={(e) => toggleMobileItem(item, e)}
                    >
                      {item.label}
                      <i className={`fas ${mobileActiveItem !== item ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                    </a>

                    <div className={`mobile-submenu ${mobileActiveItem === item ? 'show' : ''}`}>
                      <ul className="mobile-submenu-list">
                        {item.children.map((child, mcIdx) => (
                          <li key={mcIdx}>
                            {/* No deeper children */}
                            {(!child.children || child.children.length === 0) && (
                              child.routerLink ? (
                                <Link to={child.routerLink} className="mobile-submenu-link" onClick={closeMenus}>
                                  {child.label}
                                </Link>
                              ) : (
                                <a
                                  href={child.externalUrl || '#'}
                                  target={child.externalUrl ? '_blank' : undefined}
                                  rel={child.externalUrl ? 'noopener noreferrer' : undefined}
                                  className="mobile-submenu-link"
                                  onClick={closeMenus}
                                >
                                  {child.label}
                                </a>
                              )
                            )}

                            {/* Deep nesting */}
                            {child.children && child.children.length > 0 && (
                              <>
                                <a
                                  href="#"
                                  className="mobile-submenu-link"
                                  onClick={(e) => toggleMobileSubItem(child, e)}
                                >
                                  {child.label}
                                  <i className={`fas ${mobileActiveSubItem !== child ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                                </a>
                                <ul className={`mobile-deep-list ${mobileActiveSubItem === child ? 'show' : ''}`}>
                                  {child.children.map((sub, mdIdx) => (
                                    <li key={mdIdx}>
                                      {sub.routerLink ? (
                                        <Link to={sub.routerLink} className="deep-link-item" onClick={closeMenus}>
                                          {sub.label}
                                        </Link>
                                      ) : (
                                        <a
                                          href={sub.externalUrl || '#'}
                                          target={sub.externalUrl ? '_blank' : undefined}
                                          rel={sub.externalUrl ? 'noopener noreferrer' : undefined}
                                          className="deep-link-item"
                                          onClick={closeMenus}
                                        >
                                          {sub.label}
                                        </a>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          <div style={{ borderTop: '1px solid #2d4278', marginTop: '12px', paddingTop: '12px' }}>
            {isAdvisor && (
              <a href={strapiAdminUrl} target="_blank" rel="noopener noreferrer" className="mobile-nav-link" onClick={closeMenus}>
                Dashboard
              </a>
            )}
            {!user ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="mobile-nav-link" onClick={closeMenus}>Login</Link>
                <Link to="/register" className="mobile-nav-link" onClick={closeMenus}>Register</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/profile" className="mobile-nav-link" onClick={closeMenus}>
                  {user.displayName || user.username}
                </Link>
                <button className="mobile-nav-link" onClick={handleLogout} style={{ textAlign: 'left', background: 'transparent', border: 'none' }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};