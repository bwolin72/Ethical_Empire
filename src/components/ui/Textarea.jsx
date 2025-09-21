// src/components/ui/Textarea.jsx
import React from 'react';
import './ui.css';

export const Textarea = ({ className = '', ...props }) => {
  return <textarea className={`textarea ${className}`} {...props} />;
};
