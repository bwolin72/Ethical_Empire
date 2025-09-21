// src/components/splash/SplashScreen.jsx
import React, { useEffect } from 'react';
import logo from '../../assets/logo.png';
import '../styles/ui.css'; // unified CSS for animations and layout

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={logo} alt="Ethical Multimedia GH Logo" className="splash-logo-img animate-pulse" />
        <h1 className="splash-company-name animate-fade-in-up">Ethical Multimedia GH</h1>
        <p className="splash-service animate-fade-in-up delay-200">Creative Event Experiences</p>
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
