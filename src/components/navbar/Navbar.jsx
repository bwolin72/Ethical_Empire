import { React, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutHelper } from '../../utils/logoutHelper';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  /* ----------------- Window resize (detect mobile) ----------------- */
  useEffect(() => {
    const determineMobile = () => setIsMobile(window.innerWidth <= 960);
    determineMobile();
    window.addEventListener('resize', determineMobile);
    return () => window.removeEventListener('resize', determineMobile);
  }, []);

  /* ----------------- Auth check ----------------- */
  useEffect(() => {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    const refresh = localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
    setIsLoggedIn(!!(access && refresh));
  }, [location]);

  /* ----------------- Close menus on route change ----------------- */
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  /* ----------------- Close on outside click ----------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ----------------- Close on Escape ----------------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  /* ----------------- Handlers ----------------- */
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const toggleDropdown = useCallback(() => setDropdownOpen((prev) => !prev), []);

  const handleNavClick = () => {
    // closes mobile menu when any nav link is clicked
    if (menuOpen) setMenuOpen(false);
    if (dropdownOpen) setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleServicesClick = () => {
    if (isMobile) {
      toggleDropdown();
    } else {
      navigate('/services');
    }
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleDropdownItemKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDropdownItemClick(path);
    }
  };

  /* ----------------- Render ----------------- */
  return (
    <nav className="navbar" aria-label="Main navigation" ref={navRef}>
      <div className="navbar-container">
        
        {/* Logo */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={handleNavClick}
        >
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className={`menu-icon ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          {menuOpen ? '✖' : '☰'}
        </button>

        {/* Main Nav */}
        <ul
          id="primary-navigation"
          className={menuOpen ? 'nav-menu active' : 'nav-menu'}
        >
          <li className="nav-item">
            <Link to="/bookings" className="nav-links" onClick={handleNavClick}>
              Bookings
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/about" className="nav-links" onClick={handleNavClick}>
              About
            </Link>
          </li>

          {/* Services Dropdown */}
          <li
            className="nav-item dropdown"
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
              Services <span className={`caret ${dropdownOpen ? 'rotated' : ''}`}>▼</span>
            </button>

            <ul
              className={`dropdown-menu ${isMobile ? 'mobile' : 'desktop'} ${
                dropdownOpen ? 'active' : ''
              }`}
              role="menu"
              aria-label="Services submenu"
            >
              {[
                { label: 'Live Band', path: '/services/live-band' },
                { label: 'Catering', path: '/services/catering' },
                { label: 'Decor', path: '/services/decor' },
                { label: 'Media & Event Hosting', path: '/services/media-hosting' },
              ].map(({ label, path }) => (
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
            </ul>
          </li>

          <li className="nav-item">
            <Link to="/contact" className="nav-links" onClick={handleNavClick}>
              Contact
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/connect" className="nav-links" onClick={handleNavClick}>
              Connect With Us
            </Link>
          </li>

          <li className="nav-item">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="nav-links logout-btn"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="nav-links" onClick={handleNavClick}>
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
