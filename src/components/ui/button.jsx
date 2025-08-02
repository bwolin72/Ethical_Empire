// src/components/ui/Button.jsx
import React from 'react';
import './Button.css'; // Optional: if you decide to use the CSS file

export const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`btn-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
