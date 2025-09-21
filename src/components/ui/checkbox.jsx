// src/components/ui/Checkbox.jsx
import React from 'react';
import '../styles/ui.css';

export const Checkbox = ({ checked, onCheckedChange, className = '' }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onCheckedChange}
      className={`custom-checkbox ${className}`}
    />
  );
};
