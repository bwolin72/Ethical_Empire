// src/components/ui/card.jsx
import React from 'react';
import './card.css';

export function Card({ children, className = '' }) {
  return (
    <div className={`custom-card ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="card-content">{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

export function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>;
}
