import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./MustHeader.scss";
import { MENU_ITEMS, MenuItem } from "./navigation.data";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ROLES } from "../../constants/roles";
import { getMyProfile, type MyProfile } from "../../services/profileApi";

export interface MustHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const MustHeader: React.FC<MustHeaderProps> = ({
  darkMode,
  onToggleDarkMode,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeDropdown, setActiveDropdown] = useState<MenuItem | null>(null);
  const [activeLeftItem, setActiveLeftItem] = useState<MenuItem | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(
    null,
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(
    () => window.innerWidth > 991,
  );
  const [mobileActiveItem, setMobileActiveItem] = useState<MenuItem | null>(
    null,
  );
  const [mobileActiveSubItem, setMobileActiveSubItem] =
    useState<MenuItem | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const normalizeRoleToken = (value: string) =>
    value.toLowerCase().trim().replace(/[_-]/g, " ");

  const storedAuthUserRole = (() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    try {
      const raw = localStorage.getItem("must_auth_user");
      const rawData = localStorage.getItem("auth_user_data");

      let role: unknown;

      if (raw) {
        const parsed = JSON.parse(raw);
        role = parsed?.role || parsed?.user_metadata?.role;
      }

      if (!role && rawData) {
        const parsedData = JSON.parse(rawData);
        role = parsedData?.role || parsedData?.user_metadata?.role;
      }

      if (!role && raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user?.role) {
          role = parsed.user.role;
        } else if (parsed?.user?.user_metadata?.role) {
          role = parsed.user.user_metadata.role;
        }
      }

      if (!role && rawData) {
        const parsedData = JSON.parse(rawData);
        if (parsedData?.user?.role) {
          role = parsedData.user.role;
        } else if (parsedData?.user?.user_metadata?.role) {
          role = parsedData.user.user_metadata.role;
        } else if (parsedData?.role?.type) {
          role = parsedData.role.type;
        } else if (parsedData?.role?.name) {
          role = parsedData.role.name;
        }
      }

      if (!role) {
        const token =
          localStorage.getItem("must_auth_token") ||
          localStorage.getItem("auth_token");
        if (token) {
          try {
            const payloadBase64 = token.split(".")[1];
            const decodedJson = atob(payloadBase64);
            const payload = JSON.parse(decodedJson);
            role =
              payload?.role ||
              payload?.[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ];
          } catch {
            // Ignore
          }
        }
      }

      return typeof role === "string" ? normalizeRoleToken(role) : undefined;
    } catch {
      return undefined;
    }
  })();

  const isAdvisor =
    user?.role?.type === ROLES.ADMIN || storedAuthUserRole === "advisor";

  const restrictedAdvisingLabels = useMemo(() => {
    return new Set(["Announcement", "Students Data", "Statistical Reports"]);
  }, []);

  const roleTokens = [
    user?.role?.type,
    user?.role?.name,
    user?.role?.id != null ? String(user.role.id) : undefined,
    storedAuthUserRole,
    ...(profile?.roles ?? []),
    profile?.advisorProfile ? "advisor" : undefined,
    profile?.advisorProfile?.isSuperAdmin ? "super admin" : undefined,
  ]
    .filter(Boolean)
    .map((value) => normalizeRoleToken(String(value)));

  const canSeeRestrictedAdvisingItems =
    roleTokens.includes("admin") || roleTokens.includes("advisor");

  const visibleMenuItems = useMemo(() => {
    return MENU_ITEMS.map((item) => {
      if (item.label !== "Advising" || !item.children) {
        return item;
      }

      const filteredChildren = item.children.filter(
        (child) =>
          !restrictedAdvisingLabels.has(child.label) ||
          canSeeRestrictedAdvisingItems,
      );

      // If only one item remains, hide the dropdown and make it a direct link
      return {
        ...item,
        children: filteredChildren.length > 1 ? filteredChildren : undefined,
      };
    });
  }, [canSeeRestrictedAdvisingItems, restrictedAdvisingLabels]);
  const strapiAdminUrl = import.meta.env.VITE_STRAPI_URL
    ? `${import.meta.env.VITE_STRAPI_URL.replace(/\/$/, "")}/admin`
    : "#";

  const userDisplayName =
    profile?.fullName ||
    profile?.studentProfile?.fullName ||
    profile?.userName ||
    user?.username ||
    (language === "ar" ? "مستخدم" : "User");

  // Helper to translate labels
  const getLabel = (item: MenuItem) => {
    // If translationKey is available, use it, otherwise format label as key
    const key =
      item.translationKey || item.label.toLowerCase().replace(/[\s-]/g, "_");
    return t(key);
  };

  // Close menus on route change
  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) {
        if (isMounted) {
          setProfile(null);
        }
        return;
      }

      try {
        const nextProfile = await getMyProfile();
        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth > 991;
      setIsLargeScreen(large);
      if (large) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate("/");
  };

  return (
    <>
      <header className="must-header">
        <div className="header-container">
          {/* Left Logo */}
          <Link to="/" className="logo-link" title={t("home")}>
            <img
              src="/assets/1740307130_140_87669_group1000004290.svg"
              alt="MUST Logo"
              className="logo-img"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-list">
              {visibleMenuItems.map((item, idx) => (
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
                      {getLabel(item)}
                    </Link>
                  ) : (
                    <a
                      href={item.externalUrl || "#"}
                      target={item.externalUrl ? "_blank" : undefined}
                      rel={item.externalUrl ? "noopener noreferrer" : undefined}
                      className={`nav-link ${activeDropdown === item ? "active" : ""}`}
                    >
                      {getLabel(item)}
                    </a>
                  )}

                  {/* MEGA SPLIT DROPDOWN */}
                  {item.hasMegaMenu && (
                    <div
                      className={`mega-menu-overlay ${activeDropdown === item ? "show" : ""}`}
                    >
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
                                    {getLabel(child)}
                                  </Link>
                                ) : (
                                  <a
                                    href={child.externalUrl || "#"}
                                    target={
                                      child.externalUrl ? "_blank" : undefined
                                    }
                                    rel={
                                      child.externalUrl
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                    className={`left-panel-link ${activeLeftItem === child ? "active" : ""}`}
                                  >
                                    {getLabel(child)}
                                    {child.children &&
                                      child.children.length > 0 && (
                                        <i
                                          className={`fas icon-chevron ${activeLeftItem === child ? (language === "ar" ? "fa-chevron-left" : "fa-chevron-right") : "fa-chevron-down"}`}
                                        ></i>
                                      )}
                                  </a>
                                )}

                                {/* DYNAMIC RIGHT PANEL */}
                                {activeLeftItem === child &&
                                  child.children &&
                                  child.children.length > 0 && (
                                    <div className="mega-right-panel">
                                      <div className="right-content-wrapper">
                                        <ul className="right-panel-list">
                                          {child.children.map(
                                            (subChild, sIdx) => (
                                              <li
                                                key={sIdx}
                                                className="right-panel-item"
                                              >
                                                {subChild.routerLink ? (
                                                  <Link
                                                    to={subChild.routerLink}
                                                    className="right-panel-link"
                                                    onClick={closeMenus}
                                                  >
                                                    {getLabel(subChild)}
                                                  </Link>
                                                ) : (
                                                  <a
                                                    href={
                                                      subChild.externalUrl ||
                                                      "#"
                                                    }
                                                    target={
                                                      subChild.externalUrl
                                                        ? "_blank"
                                                        : undefined
                                                    }
                                                    rel={
                                                      subChild.externalUrl
                                                        ? "noopener noreferrer"
                                                        : undefined
                                                    }
                                                    className="right-panel-link"
                                                  >
                                                    {getLabel(subChild)}
                                                  </a>
                                                )}

                                                {/* 4th Level Deep Elements */}
                                                {subChild.children &&
                                                  subChild.children.length >
                                                    0 && (
                                                    <ul className="deep-panel-list">
                                                      {subChild.children.map(
                                                        (deepChild, dIdx) => (
                                                          <li key={dIdx}>
                                                            <a
                                                              href={
                                                                deepChild.externalUrl ||
                                                                "#"
                                                              }
                                                              target={
                                                                deepChild.externalUrl
                                                                  ? "_blank"
                                                                  : undefined
                                                              }
                                                              rel={
                                                                deepChild.externalUrl
                                                                  ? "noopener noreferrer"
                                                                  : undefined
                                                              }
                                                              className="deep-panel-link"
                                                            >
                                                              {getLabel(
                                                                deepChild,
                                                              )}
                                                            </a>
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  )}
                                              </li>
                                            ),
                                          )}
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
                    <div
                      className={`simple-dropdown ${activeDropdown === item ? "show" : ""}`}
                    >
                      <ul className="simple-dropdown-list">
                        {item.children.map((child, scIdx) => (
                          <li key={scIdx}>
                            {child.routerLink ? (
                              <Link
                                to={child.routerLink}
                                className="simple-dropdown-link"
                                onClick={closeMenus}
                              >
                                {getLabel(child)}
                              </Link>
                            ) : (
                              <a
                                href={child.externalUrl || "#"}
                                target={
                                  child.externalUrl ? "_blank" : undefined
                                }
                                rel={
                                  child.externalUrl
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                className="simple-dropdown-link"
                              >
                                {getLabel(child)}
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
            {/* Language Toggle Button */}
            <button
              className="icon-toggle lang-toggle"
              onClick={toggleLanguage}
              title={
                language === "en" ? t("translate_to_ar") : t("translate_to_en")
              }
              style={{ fontSize: "16px", minWidth: "40px" }}
            >
              {language === "en" ? "AR" : "EN"}
            </button>

            <button
              className="icon-toggle"
              onClick={toggleTheme}
              title={darkMode ? t("switch_to_light") : t("switch_to_dark")}
            >
              <i className={`fas ${!darkMode ? "fa-sun" : "fa-moon"}`}></i>
            </button>

            {isAdvisor && (
              <a
                href={strapiAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-auth login-btn ms-2"
                style={{ textDecoration: "none" }}
              >
                <i className="fas fa-gauge-high"></i>
                <span>{t("dashboard")}</span>
              </a>
            )}

            {!user ? (
              <>
                <Link
                  to="/login#auth"
                  className="btn-auth login-btn ms-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-user-circle"></i>
                  <span>{t("sign_in")}</span>
                </Link>
                <Link
                  to="/register#auth"
                  className="btn-auth login-btn ms-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-user-plus"></i>
                  <span>{t("register")}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="btn-auth login-btn ms-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-user"></i>
                  <span>{userDisplayName}</span>
                </Link>
                <button
                  className="btn-auth logout-btn ms-2"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{t("sign_out")}</span>
                </button>
              </>
            )}

            {/* Mobile Toggle */}
            {!isLargeScreen && (
              <button
                className="mobile-toggle ms-2"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <i
                  className={`fas ${!isMobileMenuOpen ? "fa-bars" : "fa-times"}`}
                ></i>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Overlay Navigation */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? "show" : ""}`}>
        <div className="mobile-nav-container">
          <ul className="mobile-nav-list">
            {visibleMenuItems.map((item, mIdx) => (
              <li key={mIdx} className="mobile-nav-item">
                {/* No children */}
                {!item.children &&
                  (item.routerLink ? (
                    <Link
                      to={item.routerLink}
                      className="mobile-nav-link"
                      onClick={closeMenus}
                    >
                      {getLabel(item)}
                    </Link>
                  ) : (
                    <a
                      href={item.externalUrl || "#"}
                      target={item.externalUrl ? "_blank" : undefined}
                      rel={item.externalUrl ? "noopener noreferrer" : undefined}
                      className="mobile-nav-link"
                      onClick={closeMenus}
                    >
                      {getLabel(item)}
                    </a>
                  ))}

                {/* Has children */}
                {item.children && (
                  <>
                    <a
                      href="#"
                      className="mobile-nav-link"
                      onClick={(e) => toggleMobileItem(item, e)}
                    >
                      {getLabel(item)}
                      <i
                        className={`fas ${mobileActiveItem !== item ? "fa-chevron-down" : "fa-chevron-up"}`}
                      ></i>
                    </a>

                    <div
                      className={`mobile-submenu ${mobileActiveItem === item ? "show" : ""}`}
                    >
                      <ul className="mobile-submenu-list">
                        {item.children.map((child, mcIdx) => (
                          <li key={mcIdx}>
                            {/* No deeper children */}
                            {(!child.children || child.children.length === 0) &&
                              (child.routerLink ? (
                                <Link
                                  to={child.routerLink}
                                  className="mobile-submenu-link"
                                  onClick={closeMenus}
                                >
                                  {getLabel(child)}
                                </Link>
                              ) : (
                                <a
                                  href={child.externalUrl || "#"}
                                  target={
                                    child.externalUrl ? "_blank" : undefined
                                  }
                                  rel={
                                    child.externalUrl
                                      ? "noopener noreferrer"
                                      : undefined
                                  }
                                  className="mobile-submenu-link"
                                  onClick={closeMenus}
                                >
                                  {getLabel(child)}
                                </a>
                              ))}

                            {/* Deep nesting */}
                            {child.children && child.children.length > 0 && (
                              <>
                                <a
                                  href="#"
                                  className="mobile-submenu-link"
                                  onClick={(e) => toggleMobileSubItem(child, e)}
                                >
                                  {getLabel(child)}
                                  <i
                                    className={`fas ${mobileActiveSubItem !== child ? "fa-chevron-down" : "fa-chevron-up"}`}
                                  ></i>
                                </a>
                                <ul
                                  className={`mobile-deep-list ${mobileActiveSubItem === child ? "show" : ""}`}
                                >
                                  {child.children.map((sub, mdIdx) => (
                                    <li key={mdIdx}>
                                      {sub.routerLink ? (
                                        <Link
                                          to={sub.routerLink}
                                          className="deep-link-item"
                                          onClick={closeMenus}
                                        >
                                          {getLabel(sub)}
                                        </Link>
                                      ) : (
                                        <a
                                          href={sub.externalUrl || "#"}
                                          target={
                                            sub.externalUrl
                                              ? "_blank"
                                              : undefined
                                          }
                                          rel={
                                            sub.externalUrl
                                              ? "noopener noreferrer"
                                              : undefined
                                          }
                                          className="deep-link-item"
                                          onClick={closeMenus}
                                        >
                                          {getLabel(sub)}
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

          <div
            style={{
              borderTop: "1px solid #2d4278",
              marginTop: "12px",
              paddingTop: "12px",
            }}
          >
            {isAdvisor && (
              <a
                href={strapiAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-nav-link"
                onClick={closeMenus}
              >
                {t("dashboard")}
              </a>
            )}
            {!user ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  to="/login#auth"
                  className="mobile-nav-link"
                  onClick={closeMenus}
                >
                  {t("sign_in")}
                </Link>
                <Link
                  to="/register#auth"
                  className="mobile-nav-link"
                  onClick={closeMenus}
                >
                  {t("register")}
                </Link>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={closeMenus}
                >
                  {userDisplayName}
                </Link>
                <button
                  className="mobile-nav-link"
                  onClick={handleLogout}
                  style={{
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                  }}
                >
                  {t("sign_out")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
