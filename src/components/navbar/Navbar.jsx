import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutHelper } from "../../utils/logoutHelper";
import "./Navbar.css";
import logo from "../../assets/logo.png";

const services = [
  { label: "Live Band", path: "/services/live-band" },
  { label: "Catering", path: "/services/catering" },
  { label: "Decor", path: "/services/decor" },
  { label: "Media & Event Hosting", path: "/services/media-hosting" },
];

const blogLinks = [
  { label: "Articles", path: "/blog/articles" },
  { label: "Latest", path: "/blog/latest" },
];

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
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

  // --- Close menus when route changes ---
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setBlogOpen(false);
  }, [location]);

  // --- Close on click outside or ESC ---
  useEffect(() => {
    const clickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setServicesOpen(false);
        setBlogOpen(false);
      }
    };
    const escHandler = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
        setBlogOpen(false);
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
  const toggleServices = useCallback(() => setServicesOpen((p) => !p), []);
  const toggleBlog = useCallback(() => setBlogOpen((p) => !p), []);
  const handleNavClick = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setBlogOpen(false);
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

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (section) => location.pathname.startsWith(section);

  const mobileVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: { scaleY: 1, opacity: 1 },
  };

  return (
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
            <li><Link to="/bookings" className={`nav-links ${isActive("/bookings") ? "active" : ""}`} onClick={handleNavClick}>Bookings</Link></li>
            <li><Link to="/flipbook" className={`nav-links ${isActive("/flipbook") ? "active" : ""}`} onClick={handleNavClick}>Our Profile</Link></li>
            <li><Link to="/about" className={`nav-links ${isActive("/about") ? "active" : ""}`} onClick={handleNavClick}>About</Link></li>

            {/* Services */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className={`nav-links dropdown-toggle ${isSectionActive("/services") ? "active" : ""}`} onClick={() => navigate("/services")}>
                Services <span className={`caret ${servicesOpen ? "rotated" : ""}`}>▼</span>
              </button>
              <ul className={`dropdown-menu desktop ${servicesOpen ? "active" : ""}`}>
                {services.map(({ label, path }) => (
                  <li
                    key={path}
                    className={`dropdown-item ${isActive(path) ? "active" : ""}`}
                    onClick={() => handleDropdownItemClick(path)}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </li>

            <li><Link to="/contact" className={`nav-links ${isActive("/contact") ? "active" : ""}`} onClick={handleNavClick}>Contact</Link></li>

            {/* Blog */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => setBlogOpen(true)}
              onMouseLeave={() => setBlogOpen(false)}
            >
              <button
                className={`nav-links dropdown-toggle ${isSectionActive("/blog") ? "active" : ""}`}
                onClick={() => navigate("/blog")}
              >
                Blog <span className={`caret ${blogOpen ? "rotated" : ""}`}>▼</span>
              </button>
              <ul className={`dropdown-menu desktop ${blogOpen ? "active" : ""}`}>
                {blogLinks.map(({ label, path }) => (
                  <li
                    key={path}
                    className={`dropdown-item ${isActive(path) ? "active" : ""}`}
                    onClick={() => handleDropdownItemClick(path)}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </li>

            <li><Link to="/connect" className={`nav-links ${isActive("/connect") ? "active" : ""}`} onClick={handleNavClick}>Connect With Us</Link></li>
            <li><Link to="/faq" className={`nav-links ${isActive("/faq") ? "active" : ""}`} onClick={handleNavClick}>FAQ</Link></li>

            <li>
              {isLoggedIn ? (
                <button className="nav-links logout-btn" onClick={handleLogout}>Logout</button>
              ) : (
                <Link to="/login" className={`nav-links ${isActive("/login") ? "active" : ""}`} onClick={handleNavClick}>Login</Link>
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
              <li><Link to="/bookings" className={isActive("/bookings") ? "active" : ""} onClick={handleNavClick}>Bookings</Link></li>
              <li><Link to="/flipbook" className={isActive("/flipbook") ? "active" : ""} onClick={handleNavClick}>Our Profile</Link></li>
              <li><Link to="/about" className={isActive("/about") ? "active" : ""} onClick={handleNavClick}>About</Link></li>

              {/* Services */}
              <li className="dropdown">
                <button className={`nav-links dropdown-toggle ${isSectionActive("/services") ? "active" : ""}`} onClick={toggleServices}>
                  Services <span className={`caret ${servicesOpen ? "rotated" : ""}`}>▼</span>
                </button>
                <ul className={`dropdown-menu mobile ${servicesOpen ? "active" : ""}`}>
                  {services.map(({ label, path }) => (
                    <li key={path} className={isActive(path) ? "active" : ""} onClick={() => handleDropdownItemClick(path)}>{label}</li>
                  ))}
                </ul>
              </li>

              <li><Link to="/contact" className={isActive("/contact") ? "active" : ""} onClick={handleNavClick}>Contact</Link></li>

              {/* Blog */}
              <li className="dropdown">
                <button className={`nav-links dropdown-toggle ${isSectionActive("/blog") ? "active" : ""}`} onClick={toggleBlog}>
                  Blog <span className={`caret ${blogOpen ? "rotated" : ""}`}>▼</span>
                </button>
                <ul className={`dropdown-menu mobile ${blogOpen ? "active" : ""}`}>
                  {blogLinks.map(({ label, path }) => (
                    <li
                      key={path}
                      className={isActive(path) ? "active" : ""}
                      onClick={() => handleDropdownItemClick(path)}
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </li>

              <li><Link to="/connect" className={isActive("/connect") ? "active" : ""} onClick={handleNavClick}>Connect With Us</Link></li>
              <li><Link to="/faq" className={isActive("/faq") ? "active" : ""} onClick={handleNavClick}>FAQ</Link></li>

              <li>
                {isLoggedIn ? (
                  <button className="nav-links logout-btn" onClick={handleLogout}>Logout</button>
                ) : (
                  <Link to="/login" className={isActive("/login") ? "active" : ""} onClick={handleNavClick}>Login</Link>
                )}
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
