// src/components/ui/Button.jsx
import React from 'react';
import '../../styles/ui.css';

export const Button = ({ children, className = '', ...props }) => {
  return (
    <button className={`btn ${className}`} {...props}>
      {children}
    </button>
  );
};
