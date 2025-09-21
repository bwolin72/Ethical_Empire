// src/components/ui/Label.jsx
import React from 'react';
import '../styles/ui.css';

export const Label = ({ htmlFor, children, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={`ui-label ${className}`}>
      {children}
    </label>
  );
};
