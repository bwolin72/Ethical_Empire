// src/components/nav/Navbar.jsx
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

function Navbar() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 960 : false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  /* Hide/Show on scroll */
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY.current + 10) setShowNavbar(false);
          else if (currentScrollY < lastScrollY.current - 10) setShowNavbar(true);
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Track window resize */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Check login */
  useEffect(() => {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const refresh = localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
    setIsLoggedIn(!!(access && refresh));
  }, [location]);

  /* Close menus on route change */
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setBlogOpen(false);
  }, [location]);

  /* Close on outside click or Esc */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setServicesOpen(false);
        setBlogOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
        setBlogOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const toggleServices = useCallback(() => setServicesOpen((prev) => !prev), []);
  const toggleBlog = useCallback(() => setBlogOpen((prev) => !prev), []);
  const handleNavClick = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setBlogOpen(false);
  };

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setMenuOpen(false);        // close mobile menu
    setServicesOpen(false);    // also close dropdowns
    setBlogOpen(false);
  };

  return (
    <nav className={`navbar ${showNavbar ? "show" : "hide"}`} ref={navRef}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={handleNavClick}>
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        {/* Hamburger icon */}
        <button
          type="button"
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
            <li><Link to="/bookings" className="nav-links" onClick={handleNavClick}>Bookings</Link></li>
            <li><Link to="/flipbook" className="nav-links" onClick={handleNavClick}>Our Profile</Link></li>
            <li><Link to="/about" className="nav-links" onClick={handleNavClick}>About</Link></li>

            {/* Services Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="nav-links dropdown-toggle"
                      onClick={!isMobile ? () => navigate("/services") : toggleServices}>
                Services <span className={`caret ${servicesOpen ? "rotated" : ""}`}>▼</span>
              </button>
              <ul className={`dropdown-menu desktop ${servicesOpen ? "active" : ""}`}>
                {services.map(({ label, path }) => (
                  <li key={path} className="dropdown-item" onClick={() => handleDropdownItemClick(path)}>
                    {label}
                  </li>
                ))}
              </ul>
            </li>

            <li><Link to="/contact" className="nav-links" onClick={handleNavClick}>Contact</Link></li>

            {/* Blog Dropdown */}
            <li
              className="nav-item dropdown"
              onMouseEnter={() => setBlogOpen(true)}
              onMouseLeave={() => setBlogOpen(false)}
            >
              <button className="nav-links dropdown-toggle"
                      onClick={!isMobile ? () => navigate("/blog") : toggleBlog}>
                Blog <span className={`caret ${blogOpen ? "rotated" : ""}`}>▼</span>
              </button>
              <ul className={`dropdown-menu desktop ${blogOpen ? "active" : ""}`}>
                {blogLinks.map(({ label, path }) => (
                  <li key={path} className="dropdown-item" onClick={() => handleDropdownItemClick(path)}>
                    {label}
                  </li>
                ))}
              </ul>
            </li>

            <li><Link to="/connect" className="nav-links" onClick={handleNavClick}>Connect With Us</Link></li>
            <li><Link to="/faq" className="nav-links" onClick={handleNavClick}>FAQ</Link></li>

            <li>
              {isLoggedIn ? (
                <button className="nav-links logout-btn" onClick={handleLogout}>Logout</button>
              ) : (
                <Link to="/login" className="nav-links" onClick={handleNavClick}>Login</Link>
              )}
            </li>
          </ul>
        )}

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobile && menuOpen && (
            <motion.ul
              className="nav-menu mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <li><Link to="/bookings" onClick={handleNavClick}>Bookings</Link></li>
              <li><Link to="/flipbook" onClick={handleNavClick}>Our Profile</Link></li>
              <li><Link to="/about" onClick={handleNavClick}>About</Link></li>

              {/* Services Mobile */}
              <li className="dropdown">
                <button className="nav-links dropdown-toggle" onClick={toggleServices}>
                  Services <span className={`caret ${servicesOpen ? "rotated" : ""}`}>▼</span>
                </button>
                <ul className={`dropdown-menu mobile ${servicesOpen ? "active" : ""}`}>
                  {services.map(({ label, path }) => (
                    <li key={path} onClick={() => handleDropdownItemClick(path)}>{label}</li>
                  ))}
                </ul>
              </li>

              <li><Link to="/contact" onClick={handleNavClick}>Contact</Link></li>

              {/* Blog Mobile */}
              <li className="dropdown">
                <button className="nav-links dropdown-toggle" onClick={toggleBlog}>
                  Blog <span className={`caret ${blogOpen ? "rotated" : ""}`}>▼</span>
                </button>
                <ul className={`dropdown-menu mobile ${blogOpen ? "active" : ""}`}>
                  {blogLinks.map(({ label, path }) => (
                    <li key={path} onClick={() => handleDropdownItemClick(path)}>{label}</li>
                  ))}
                </ul>
              </li>

              <li><Link to="/connect" onClick={handleNavClick}>Connect With Us</Link></li>
              <li><Link to="/faq" onClick={handleNavClick}>FAQ</Link></li>

              <li>
                {isLoggedIn ? (
                  <button className="nav-links logout-btn" onClick={handleLogout}>Logout</button>
                ) : (
                  <Link to="/login" onClick={handleNavClick}>Login</Link>
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
