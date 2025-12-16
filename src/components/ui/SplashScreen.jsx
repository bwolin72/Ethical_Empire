import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import logo from '../../assets/logo.png';
import '../styles/ui.css';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen" role="status" aria-label="Loading application">
      <div className="splash-content">
        {/* Logo */}
        <div className="splash-logo">
          <img 
            src={logo} 
            alt="Ethical Multimedia GH Logo" 
            className="splash-logo-img"
            width={140}
            height={140}
          />
        </div>
        
        {/* Company Name */}
        <h1 className="splash-company-name animate-fade-in-up">
          Ethical Multimedia GH
        </h1>
        
        {/* Tagline */}
        <p className="splash-service animate-fade-in-up">
          Premium Event Experiences & Creative Solutions
        </p>
        
        {/* Loading Animation */}
        <div className="splash-loader" aria-hidden="true">
          <div className="splash-loader-dot"></div>
          <div className="splash-loader-dot"></div>
          <div className="splash-loader-dot"></div>
        </div>
        
        {/* Screen Reader Text */}
        <span className="sr-only">
          Loading Ethical Multimedia GH application, please wait...
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
