import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutHelper } from "../../utils/logoutHelper";
import "./Navbar.css";
import logo from "../../assets/logo.png";

// Import service categories for better organization
import { serviceCategories } from "../services/data/serviceCategories";

// Define services with theme classes
const services = [
  { label: "All Services", path: "/services", theme: "default" },
  { label: "Live Band", path: "/services/live-band", theme: "live-band" },
  { label: "Catering", path: "/services/catering", theme: "catering" },
  { label: "Decor & Styling", path: "/services/decor", theme: "decor" },
  { label: "Media & Hosting", path: "/services/media-hosting", theme: "multimedia" },
  { label: "General Services", path: "/services/general", theme: "multimedia" },
];

const blogLinks = [
  { label: "All Articles", path: "/blog" },
  { label: "Latest Posts", path: "/blog/latest" },
  { label: "Event Tips", path: "/blog/category/tips" },
  { label: "Industry News", path: "/blog/category/news" },
];

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState({ services: false, blog: false });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  const lastScrollY = useRef(0);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // --- Navbar hide/show on scroll ---
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowNavbar(currentY < lastScrollY.current - 10 || currentY < 50);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Responsive state ---
  useEffect(() => {
    const resizeHandler = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  // --- Login state ---
  useEffect(() => {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const refresh = localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
    setIsLoggedIn(Boolean(access && refresh));
  }, [location]);

  // --- Close menus on route change ---
  useEffect(() => {
    setMenuOpen(false);
    setDropdown({ services: false, blog: false });
  }, [location]);

  // --- Click outside or ESC to close ---
  useEffect(() => {
    const clickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setDropdown({ services: false, blog: false });
      }
    };
    const escHandler = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropdown({ services: false, blog: false });
      }
    };
    document.addEventListener("mousedown", clickOutside);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
      document.removeEventListener("keydown", escHandler);
    };
  }, []);

  // --- Helpers ---
  const toggleMenu = useCallback(() => setMenuOpen((p) => !p), []);
  const toggleDropdown = useCallback(
    (type) => setDropdown((prev) => ({ ...prev, [type]: !prev[type] })),
    []
  );

  const handleNavClick = () => {
    setMenuOpen(false);
    setDropdown({ services: false, blog: false });
  };

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
    handleNavClick();
    navigate("/login");
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    handleNavClick();
  };

  const handleMainSectionClick = (section, basePath) => {
    navigate(basePath);
    if (isMobile) {
      toggleDropdown(section);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (section) => location.pathname.startsWith(section);

  const mobileVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: { scaleY: 1, opacity: 1 },
  };

  // --- Shared Nav Links ---
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Bookings", path: "/bookings" },
    { label: "Our Profile", path: "/flipbook" },
    { label: "About", path: "/about" },
    {
      label: "Services",
      section: "services",
      items: services,
      basePath: "/services",
      description: "Explore all our professional services",
    },
    { label: "Contact", path: "/contact" },
    {
      label: "Blog",
      section: "blog",
      items: blogLinks,
      basePath: "/blog",
      description: "Read our latest articles and tips",
    },
    { label: "Connect", path: "/connect" },
    { label: "FAQ", path: "/faq" },
  ];

  // Get theme color for service item
  const getThemeColor = (theme) => {
    switch(theme) {
      case 'live-band': return 'var(--burgundy)';
      case 'catering': return 'var(--forest)';
      case 'decor': return 'var(--sand)';
      case 'multimedia': return 'var(--navy)';
      default: return 'var(--gold)';
    }
  };

  return (
    <>
      <nav ref={navRef} className={`navbar ${showNavbar ? "show" : "hide"}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={handleNavClick}>
            <img src={logo} alt="EETHM Logo" className="logo-img" />
            <span className="logo-text">EETHM_GH</span>
          </Link>

          {/* Hamburger */}
          <button
            className={`menu-icon ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✖" : "☰"}
          </button>

          {/* Desktop Menu */}
          {!isMobile && (
            <ul className="nav-menu">
              {navLinks.map(({ label, path, section, items, basePath, description }) =>
                section ? (
                  <li
                    key={section}
                    className="nav-item dropdown"
                    onMouseEnter={() => setDropdown((d) => ({ ...d, [section]: true }))}
                    onMouseLeave={() => setDropdown((d) => ({ ...d, [section]: false }))}
                  >
                    <div className="dropdown-header">
                      <Link
                        to={basePath}
                        className={`nav-links dropdown-main-link ${
                          isSectionActive(basePath) ? "active" : ""
                        }`}
                        onClick={() => handleMainSectionClick(section, basePath)}
                      >
                        {label}
                      </Link>
                      <button
                        className="dropdown-caret"
                        onClick={() => toggleDropdown(section)}
                        aria-label={`Toggle ${label} dropdown`}
                      >
                        <span className={`caret ${dropdown[section] ? "rotated" : ""}`}>▼</span>
                      </button>
                    </div>
                    <ul className={`dropdown-menu desktop ${dropdown[section] ? "active" : ""}`}>
                      <li className="dropdown-header-info">
                        <span className="dropdown-title">{label}</span>
                        {description && <span className="dropdown-description">{description}</span>}
                      </li>
                      {items.map(({ label: itemLabel, path: itemPath, theme }) => (
                        <li
                          key={itemPath}
                          className={`dropdown-item ${isActive(itemPath) ? "active" : ""}`}
                          onClick={() => handleDropdownItemClick(itemPath)}
                          style={theme ? { '--theme-color': getThemeColor(theme) } : {}}
                        >
                          {itemLabel}
                          {theme && <span className="theme-indicator" style={{ backgroundColor: getThemeColor(theme) }} />}
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={path}>
                    <Link
                      to={path}
                      className={`nav-links ${isActive(path) ? "active" : ""}`}
                      onClick={handleNavClick}
                    >
                      {label}
                    </Link>
                  </li>
                )
              )}
              <li>
                {isLoggedIn ? (
                  <button className="nav-links logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className={`nav-links ${isActive("/login") ? "active" : ""}`}
                    onClick={handleNavClick}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          )}

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobile && menuOpen && (
              <motion.ul
                className="nav-menu mobile active"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={mobileVariants}
                style={{ transformOrigin: "top" }}
              >
                {navLinks.map(({ label, path, section, items, basePath, description }) =>
                  section ? (
                    <li key={section} className="dropdown">
                      <div className="dropdown-header mobile">
                        <Link
                          to={basePath}
                          className={`nav-links dropdown-main-link ${
                            isSectionActive(basePath) ? "active" : ""
                          }`}
                          onClick={() => handleMainSectionClick(section, basePath)}
                        >
                          {label}
                        </Link>
                        <button
                          className="dropdown-caret"
                          onClick={() => toggleDropdown(section)}
                          aria-label={`Toggle ${label} dropdown`}
                        >
                          <span className={`caret ${dropdown[section] ? "rotated" : ""}`}>▼</span>
                        </button>
                      </div>
                      <ul className={`dropdown-menu mobile ${dropdown[section] ? "active" : ""}`}>
                        <li className="dropdown-header-info">
                          <span className="dropdown-title">{label}</span>
                          {description && <span className="dropdown-description">{description}</span>}
                        </li>
                        {items.map(({ label: itemLabel, path: itemPath, theme }) => (
                          <li
                            key={itemPath}
                            className={`dropdown-item ${isActive(itemPath) ? "active" : ""}`}
                            onClick={() => handleDropdownItemClick(itemPath)}
                            style={theme ? { '--theme-color': getThemeColor(theme) } : {}}
                          >
                            {itemLabel}
                            {theme && <span className="theme-indicator" style={{ backgroundColor: getThemeColor(theme) }} />}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li key={path}>
                      <Link
                        to={path}
                        className={`nav-links ${isActive(path) ? "active" : ""}`}
                        onClick={handleNavClick}
                      >
                        {label}
                      </Link>
                    </li>
                  )
                )}
                <li>
                  {isLoggedIn ? (
                    <button className="nav-links logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className={`nav-links ${isActive("/login") ? "active" : ""}`}
                      onClick={handleNavClick}
                    >
                      Login
                    </Link>
                  )}
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer below the navbar */}
      <div className="navbar-spacer"></div>
    </>
  );
}
