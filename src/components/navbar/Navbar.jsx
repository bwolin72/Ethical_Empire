import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
      if (window.innerWidth > 960) setDropdownOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        {/* Mobile menu toggle */}
        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? '✖' : '☰'}
        </div>

        <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/bookings" className="nav-links">
              Bookings
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/about" className="nav-links">
              About
            </Link>
          </li>

          {/* Services Dropdown */}
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
                  <Link to="/services/live-band" className="dropdown-link">
                    Live Band
                  </Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/catering" className="dropdown-link">
                    Catering
                  </Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/decor" className="dropdown-link">
                    Decor
                  </Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/media-hosting" className="dropdown-link">
                    Media & Event Hosting
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="nav-item">
            <Link to="/contact" className="nav-links">
              Contact
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/connect" className="nav-links">
              Connect With Us
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
