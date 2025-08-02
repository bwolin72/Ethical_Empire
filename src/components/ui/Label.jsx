import React from 'react';
import './label.css';

export const Label = ({ htmlFor, children, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={`ui-label ${className}`}>
      {children}
    </label>
  );
};
