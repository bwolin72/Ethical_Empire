import React from 'react';
import './label.css';

export default function label({ htmlFor, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`ui-label ${className}`}>
      {children}
    </label>
  );
}
export { label };