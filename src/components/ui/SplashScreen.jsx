// src/components/splash/SplashScreen.jsx
import React, { useEffect } from "react";
import logo from "../../assets/logo.png";
import "./SplashScreen.css"; // make sure this imports your styles

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Logo */}
        <img
          src={logo}
          alt="Ethical Multimedia GH Logo"
          className="splash-logo-img animate-pulse"
        />

        {/* Company Name */}
        <h1 className="splash-company-name animate-fade-in-up">
          Ethical Multimedia GH
        </h1>

        {/* Tagline */}
        <p className="splash-service animate-fade-in-up delay-200">
          Creative Event Experiences
        </p>

        {/* Loader dots */}
        <div className="splash-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
