// src/components/ui/Input.jsx

import React from 'react';
import './Input.css';

const Input = ({ className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`custom-input ${className}`}
    />
  );
};

export { Input };
