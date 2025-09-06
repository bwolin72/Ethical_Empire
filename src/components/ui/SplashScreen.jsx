import React, { useEffect } from "react";
import logo from "../../assets/logo.png"; // Ensure this file exists
import "./SplashScreen.css"; // Optional, see below for fallback styles

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={logo} alt="Company Logo" className="splash-logo-img" />
        <h1 className="splash-company-name">Ethical Multimedia GH</h1>
        <p className="splash-service">Creative Event Experiences</p>
      </div>
    </div>
  );
};

export default SplashScreen;
