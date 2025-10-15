import React from "react";
import { Link } from "react-router-dom";
import "./Unauthorized.css";
import logo from "../../assets/logo.png"; // adjust this path as needed

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-overlay" />

      <div className="unauthorized-content animate-fade-in-up">
        <img src={logo} alt="Ethical Empire Logo" className="unauthorized-logo" />

        <h1 className="unauthorized-title">401</h1>
        <h2 className="unauthorized-subtitle">Access Denied</h2>

        <p className="unauthorized-text">
          This area is reserved for authorized members of the Ethical Empire.  
          You may need to sign in or request permission to continue.
        </p>

        <div className="unauthorized-actions">
          <Link to="/login" className="unauthorized-btn">
            Sign In
          </Link>
          <Link to="/" className="unauthorized-btn outline">
            Back to Home
          </Link>
          <Link to="/contact" className="unauthorized-btn outline">
            Contact Support
          </Link>
        </div>
      </div>

      <footer className="unauthorized-footer">
        © {new Date().getFullYear()} Ethical Empire — Luxury Multimedia & Events
      </footer>
    </div>
  );
};

export default Unauthorized;
