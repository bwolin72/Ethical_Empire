import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Initialize mobile state and add resize listener
  useEffect(() => {
    const determineMobile = () => setIsMobile(window.innerWidth <= 960);
    determineMobile();
    window.addEventListener('resize', determineMobile);
    return () => window.removeEventListener('resize', determineMobile);
  }, []);

  // Detect login status from storage (runs when location changes)
  useEffect(() => {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    const refresh = localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
    setIsLoggedIn(!!(access && refresh));
  }, [location]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Close menus if click outside
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

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);
  const toggleDropdown = useCallback(() => setDropdownOpen(prev => !prev), []);

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Services click: mobile toggles submenu; desktop navigates
  const handleServicesClick = (e) => {
    // prevent default only if element is a link; here it's a button-like element
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

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        <button
          className="menu-icon"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✖' : '☰'}
        </button>

        <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/bookings" className="nav-links" onClick={() => setMenuOpen(false)}>Bookings</Link>
          </li>

          <li className="nav-item">
            <Link to="/about" className="nav-links" onClick={() => setMenuOpen(false)}>About</Link>
          </li>

          <li
            className="nav-item dropdown"
            onMouseEnter={() => !isMobile && setDropdownOpen(true)}
            onMouseLeave={() => !isMobile && setDropdownOpen(false)}
          >
            {/* Use a button for accessibility */}
            <button
              type="button"
              className="nav-links dropdown-toggle"
              onClick={handleServicesClick}
              onKeyDown={(e) => { if (e.key === 'Enter') handleServicesClick(e); }}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              Services <span className={`caret ${dropdownOpen ? 'rotated' : ''}`}>▼</span>
            </button>

            {/* Always render the dropdown so CSS can animate. Toggle classes for mobile and programmatic show */}
            <ul
              className={`dropdown-menu ${isMobile ? 'mobile' : 'desktop'} ${dropdownOpen ? 'mobile-visible active' : ''}`}
              role="menu"
              aria-label="Services submenu"
            >
              <li
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => handleDropdownItemClick('/services/live-band')}
                onKeyDown={(e) => handleDropdownItemKeyDown(e, '/services/live-band')}
              >
                Live Band
              </li>
              <li
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => handleDropdownItemClick('/services/catering')}
                onKeyDown={(e) => handleDropdownItemKeyDown(e, '/services/catering')}
              >
                Catering
              </li>
              <li
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => handleDropdownItemClick('/services/decor')}
                onKeyDown={(e) => handleDropdownItemKeyDown(e, '/services/decor')}
              >
                Decor
              </li>
              <li
                className="dropdown-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => handleDropdownItemClick('/services/media-hosting')}
                onKeyDown={(e) => handleDropdownItemKeyDown(e, '/services/media-hosting')}
              >
                Media & Event Hosting
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <Link to="/contact" className="nav-links" onClick={() => setMenuOpen(false)}>Contact</Link>
          </li>

          <li className="nav-item">
            <Link to="/connect" className="nav-links" onClick={() => setMenuOpen(false)}>Connect With Us</Link>
          </li>

          <li className="nav-item">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="nav-links logout-btn">Logout</button>
            ) : (
              <Link to="/login" className="nav-links" onClick={() => setMenuOpen(false)}>Login</Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
