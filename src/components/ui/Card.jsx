// src/components/ui/Card.jsx
import React from 'react';
import '../styles/ui.css';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};
