import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoutHelper } from '../../utils/logoutHelper';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    const refresh = localStorage.getItem('refresh') || sessionStorage.getItem('refresh');
    setIsLoggedIn(!!(access && refresh));
  }, [location]);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

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
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const handleLogout = async () => {
    await logoutHelper();
    setIsLoggedIn(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
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
            onClick={() => isMobile && toggleDropdown()}
            onMouseEnter={() => !isMobile && setDropdownOpen(true)}
            onMouseLeave={() => !isMobile && setDropdownOpen(false)}
          >
            <div className="nav-links dropdown-toggle">
              Services <span className="caret">▼</span>
            </div>

            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li className="dropdown-item">
                  <Link to="/services/live-band" className="dropdown-link" onClick={() => setMenuOpen(false)}>Live Band</Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/catering" className="dropdown-link" onClick={() => setMenuOpen(false)}>Catering</Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/decor" className="dropdown-link" onClick={() => setMenuOpen(false)}>Decor</Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/media-hosting" className="dropdown-link" onClick={() => setMenuOpen(false)}>Media & Event Hosting</Link>
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
