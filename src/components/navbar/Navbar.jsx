import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutHelper } from '../../utils/logoutHelper';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect login status from storage
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

  // Handle screen resize for responsive dropdown behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 960;
      setIsMobile(mobile);
      if (!mobile) setDropdownOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Clicking "Services"
  const handleServicesClick = (e) => {
    e.preventDefault();
    if (isMobile) {
      // Mobile: toggle submenu
      setDropdownOpen(prev => !prev);
    } else {
      // Desktop: navigate
      navigate('/services');
    }
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        <div
          className="menu-icon"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') toggleMenu(); }}
        >
          {menuOpen ? '✖' : '☰'}
        </div>

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
            <div
              className="nav-links dropdown-toggle"
              onClick={handleServicesClick}
              role="link"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleServicesClick(e); }}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              Services <span className={`caret ${dropdownOpen ? 'rotated' : ''}`}>▼</span>
            </div>

            {dropdownOpen && (
              <ul className="dropdown-menu mobile-visible">
                <li className="dropdown-item" onClick={() => handleDropdownItemClick('/services/live-band')} tabIndex={0}>
                  Live Band
                </li>
                <li className="dropdown-item" onClick={() => handleDropdownItemClick('/services/catering')} tabIndex={0}>
                  Catering
                </li>
                <li className="dropdown-item" onClick={() => handleDropdownItemClick('/services/decor')} tabIndex={0}>
                  Decor
                </li>
                <li className="dropdown-item" onClick={() => handleDropdownItemClick('/services/media-hosting')} tabIndex={0}>
                  Media & Event Hosting
                </li>
              </ul>
            )}
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
