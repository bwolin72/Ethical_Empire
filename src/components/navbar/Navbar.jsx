import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  /* ----------------- Resize listener ----------------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ----------------- Auth check ----------------- */
  useEffect(() => {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const refresh = localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
    setIsLoggedIn(!!(access && refresh));
  }, [location]);

  /* ----------------- Close menus on route change ----------------- */
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  /* ----------------- Outside click & Escape ----------------- */
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

  /* ----------------- Handlers ----------------- */
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const toggleDropdown = useCallback(() => setDropdownOpen((prev) => !prev), []);
  const handleNavClick = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
    handleNavClick();
    navigate("/login");
  };

  const handleServicesClick = () => {
    if (isMobile) {
      toggleDropdown();
    } else {
      navigate("/services");
    }
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    handleNavClick();
  };

  const handleDropdownItemKeyDown = (e, path) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      handleDropdownItemClick(path);
    }
  };

  /* ----------------- Render ----------------- */
  return (
    <nav className="navbar" aria-label="Main navigation" ref={navRef}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={handleNavClick}>
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

        {/* Main Nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.ul
              id="primary-navigation"
              className="nav-menu"
              role="menubar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <li className="nav-item" role="none">
                <Link
                  to="/bookings"
                  className={`nav-links ${
                    location.pathname === "/bookings" ? "active" : ""
                  }`}
                  onClick={handleNavClick}
                  role="menuitem"
                >
                  Bookings
                </Link>
              </li>

              <li className="nav-item" role="none">
                <Link
                  to="/about"
                  className={`nav-links ${
                    location.pathname === "/about" ? "active" : ""
                  }`}
                  onClick={handleNavClick}
                  role="menuitem"
                >
                  About
                </Link>
              </li>

              {/* Services Dropdown */}
              <li
                className="nav-item dropdown"
                role="none"
                onMouseEnter={() => !isMobile && setDropdownOpen(true)}
                onMouseLeave={() => !isMobile && setDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="nav-links dropdown-toggle"
                  onClick={handleServicesClick}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  Services{" "}
                  <span className={`caret ${dropdownOpen ? "rotated" : ""}`}>
                    ▼
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul
                      className={`dropdown-menu ${isMobile ? "mobile" : "desktop"}`}
                      role="menu"
                      aria-label="Services submenu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {services.map(({ label, path }) => (
                        <li
                          key={path}
                          className="dropdown-item"
                          role="menuitem"
                          tabIndex={0}
                          onClick={() => handleDropdownItemClick(path)}
                          onKeyDown={(e) => handleDropdownItemKeyDown(e, path)}
                        >
                          {label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>

              <li className="nav-item" role="none">
                <Link
                  to="/contact"
                  className={`nav-links ${
                    location.pathname === "/contact" ? "active" : ""
                  }`}
                  onClick={handleNavClick}
                  role="menuitem"
                >
                  Contact
                </Link>
              </li>

              <li className="nav-item" role="none">
                <Link
                  to="/connect"
                  className={`nav-links ${
                    location.pathname === "/connect" ? "active" : ""
                  }`}
                  onClick={handleNavClick}
                  role="menuitem"
                >
                  Connect With Us
                </Link>
              </li>

              <li className="nav-item" role="none">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="nav-links logout-btn"
                    role="menuitem"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className={`nav-links ${
                      location.pathname === "/login" ? "active" : ""
                    }`}
                    onClick={handleNavClick}
                    role="menuitem"
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
  );
}

export default Navbar;
