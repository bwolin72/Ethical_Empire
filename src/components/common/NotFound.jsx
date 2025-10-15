import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";
import logo from "../../assets/logo.png"; // ← update this path as needed

const NotFound = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="notfound-page">
      <div className="notfound-overlay" />

      <div className="notfound-content animate-fade-in-up">
        <img src={logo} alt="Ethical Empire Logo" className="notfound-logo" />

        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Lost in the Spotlight?</h2>

        <p className="notfound-text">
          It looks like this page took an early exit from the stage.  
          Don’t worry — your next great experience is just a click away.
        </p>

        {/* 🔍 Search Bar */}
        <form onSubmit={handleSearch} className="notfound-search-form">
          <input
            type="text"
            placeholder="Search our site..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="notfound-input"
          />
          <button type="submit" className="notfound-search-btn">
            Search
          </button>
        </form>

        {/* 🔗 Quick Navigation Links */}
        <div className="notfound-links">
          <Link to="/" className="notfound-btn">
            Home
          </Link>
          <Link to="/services" className="notfound-btn outline">
            Our Services
          </Link>
          <Link to="/contact" className="notfound-btn outline">
            Contact Us
          </Link>
          <Link to="/bookings" className="notfound-btn outline">
            Book an Event
          </Link>
        </div>
      </div>

      <footer className="notfound-footer">
        © {new Date().getFullYear()} Ethical Empire — Luxury Multimedia & Events
      </footer>
    </div>
  );
};

export default NotFound;
