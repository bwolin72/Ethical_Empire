// src/components/ui/UnauthorizedPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import logo from "../../assets/logo1.png";
import "../styles/ui.css"; // unified theme styles

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <img src={logo} alt="Eethm Logo" className="unauthorized-logo" />
        <ShieldAlert className="unauthorized-icon" size={70} />
        <h1>Access Denied</h1>
        <p>
          You don’t have permission to view this page.
          <br />
          Please log in with an authorized account or return home.
        </p>

        <div className="unauthorized-actions">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-outline" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>

        <footer className="unauthorized-footer">
          &copy; {new Date().getFullYear()} Eethm. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
