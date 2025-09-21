// src/components/ui/Card.jsx
import React from 'react';
import '../styles/ui.css';

/**
 * Card - wrapper component
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * CardContent - for inner content styling
 */
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  );
};
