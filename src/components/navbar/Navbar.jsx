// src/components/nav/Navbar.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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

function Navbar() {
  // SSR-safe initial mobile detection
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 960 : false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const dropdownWrapperRef = useRef(null);

  // Toggle handlers
  const toggleMenu = useCallback(() => setMenuOpen((p) => !p), []);
  const toggleDropdown = useCallback(() => setDropdownOpen((p) => !p), []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide / show navbar on scroll (throttle w/ requestAnimationFrame)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY > lastScrollY.current + 10) setShowNavbar(false);
          else if (currentY < lastScrollY.current - 10) setShowNavbar(true);
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Login state (simple)
  useEffect(() => {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const refresh = localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
    setIsLoggedIn(!!(access && refresh));
  }, [location]);

  // Close menus when navigating
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const handleServicesClick = () => {
    if (isMobile) toggleDropdown();
    else navigate("/services");
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const handleDropdownItemKeyDown = (e, path) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      handleDropdownItemClick(path);
    }
  };

  // When focus leaves dropdown wrapper, close it (keyboard support)
  const handleDropdownBlur = (e) => {
    const related = e.relatedTarget;
    if (!dropdownWrapperRef.current) return;
    if (!dropdownWrapperRef.current.contains(related)) {
      setDropdownOpen(false);
    }
  };

  return (
    <nav
      className={`navbar ${showNavbar ? "show" : "hide"}`}
      aria-label="Main navigation"
      ref={navRef}
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className={`menu-icon ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* Desktop nav */}
        {!isMobile && (
          <ul id="primary-navigation" className="nav-menu">
            <li className="nav-item">
              <Link to="/bookings" className={`nav-links ${location.pathname === "/bookings" ? "active" : ""}`} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>Bookings</Link>
            </li>
            <li className="nav-item">
              <Link to="/flipbook" className={`nav-links ${location.pathname === "/flipbook" ? "active" : ""}`} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>Our Profile</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className={`nav-links ${location.pathname === "/about" ? "active" : ""}`} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>About</Link>
            </li>

            <li className="nav-item dropdown" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
              <div ref={dropdownWrapperRef} onBlur={handleDropdownBlur}>
                <button
                  id="services-toggle"
                  type="button"
                  className="nav-links dropdown-toggle"
                  onClick={handleServicesClick}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-controls="services-menu"
                >
                  Services <span className={`caret ${dropdownOpen ? "rotated" : ""}`}>▼</span>
                </button>

                <ul id="services-menu" className={`dropdown-menu desktop ${dropdownOpen ? "active" : ""}`} aria-labelledby="services-toggle">
                  {services.map(({ label, path }) => (
                    <li key={path} className="dropdown-item"
                        onClick={() => handleDropdownItemClick(path)}
                        onKeyDown={(e) => handleDropdownItemKeyDown(e, path)}
                        tabIndex={0}
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li className="nav-item">
              <Link to="/contact" className={`nav-links ${location.pathname === "/contact" ? "active" : ""}`} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>Contact</Link>
            </li>
            <li className="nav-item">
              <Link to="/connect" className={`nav-links ${location.pathname === "/connect" ? "active" : ""}`} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>Connect With Us</Link>
            </li>
            <li className="nav-item">
              <Link to="/faq" className={`nav-links ${location.pathname === "/faq" ? "active" : ""}`} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>FAQ</Link>
            </li>

            <li className="nav-item">
              {isLoggedIn ? (
                <button type="button" onClick={handleLogout} className="nav-links logout-btn">Logout</button>
              ) : (
                <Link to="/login" className={`nav-links ${location.pathname === "/login" ? "active" : ""}`} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>Login</Link>
              )}
            </li>
          </ul>
        )}

        {/* Mobile nav via AnimatePresence */}
        <AnimatePresence>
          {isMobile && menuOpen && (
            <motion.ul
              id="primary-navigation"
              className={`nav-menu mobile active`}
              role="menu"
              initial={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -8 }}
              transition={{ duration: 0.22 }}
            >
              <li className="nav-item"><Link to="/bookings" className="nav-links" onClick={() => setMenuOpen(false)}>Bookings</Link></li>
              <li className="nav-item"><Link to="/flipbook" className="nav-links" onClick={() => setMenuOpen(false)}>Our Profile</Link></li>
              <li className="nav-item"><Link to="/about" className="nav-links" onClick={() => setMenuOpen(false)}>About</Link></li>

              <li className="nav-item dropdown">
                <button
                  type="button"
                  className="nav-links dropdown-toggle"
                  onClick={toggleDropdown}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  Services <span className={`caret ${dropdownOpen ? "rotated" : ""}`}>▼</span>
                </button>

                <ul className={`dropdown-menu mobile ${dropdownOpen ? "active" : ""}`}>
                  {services.map(({ label, path }) => (
                    <li key={path} className="dropdown-item" tabIndex={0}
                        onClick={() => handleDropdownItemClick(path)}
                        onKeyDown={(e) => handleDropdownItemKeyDown(e, path)}
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </li>

              <li className="nav-item"><Link to="/contact" className="nav-links" onClick={() => setMenuOpen(false)}>Contact</Link></li>
              <li className="nav-item"><Link to="/connect" className="nav-links" onClick={() => setMenuOpen(false)}>Connect With Us</Link></li>
              <li className="nav-item"><Link to="/faq" className="nav-links" onClick={() => setMenuOpen(false)}>FAQ</Link></li>

              <li className="nav-item">
                {isLoggedIn ? (
                  <button type="button" onClick={() => { handleLogout(); }} className="nav-links logout-btn">Logout</button>
                ) : (
                  <Link to="/login" className="nav-links" onClick={() => setMenuOpen(false)}>Login</Link>
                )}
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;
