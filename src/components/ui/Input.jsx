// src/components/ui/Input.jsx
import React from 'react';
import './ui.css';

export const Input = ({ className = '', ...props }) => {
  return <input className={`input ${className}`} {...props} />;
};
