// src/components/ui/Textarea.jsx
import React from 'react';
import '../styles/ui.css';

export const Textarea = ({ className = '', ...props }) => {
  return <textarea className={`textarea ${className}`} {...props} />;
};
