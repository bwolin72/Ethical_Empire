import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo.png'; // adjust path if needed

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (dropdownOpen) setDropdownOpen(false);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    if (window.innerWidth <= 960) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <img src={logo} alt="EETHM Logo" className="logo-img" />
          <span className="logo-text">EETHM_GH</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? '✖' : '☰'}
        </div>

        <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/bookings" className="nav-links" onClick={closeMobileMenu}>
              Bookings
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-links" onClick={closeMobileMenu}>
              About
            </Link>
          </li>

          <li
            className="nav-item dropdown-toggle"
            onClick={toggleDropdown}
            onMouseEnter={() => window.innerWidth > 960 && setDropdownOpen(true)}
            onMouseLeave={() => window.innerWidth > 960 && setDropdownOpen(false)}
          >
            <div className="nav-links">
              Services <span className="caret">▼</span>
            </div>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li className="dropdown-item">
                  <Link to="/services/live-band" className="dropdown-link" onClick={closeMobileMenu}>
                    Live Band
                  </Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/catering" className="dropdown-link" onClick={closeMobileMenu}>
                    Catering
                  </Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/decor" className="dropdown-link" onClick={closeMobileMenu}>
                    Decor
                  </Link>
                </li>
                <li className="dropdown-item">
                  <Link to="/services/media-hosting" className="dropdown-link" onClick={closeMobileMenu}>
                    Media & Event Hosting
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="nav-item">
            <Link to="/contact" className="nav-links" onClick={closeMobileMenu}>
              Contact
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/connect" className="nav-links" onClick={closeMobileMenu}>
              Connect With Us
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
