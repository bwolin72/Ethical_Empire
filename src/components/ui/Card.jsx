import React from 'react';
import '../styles/ui.css';

export const Card = ({
  children,
  title,
  subtitle,
  variant = 'default',
  className = '',
  ...props
}) => {
  const cardClasses = [
    'card',
    variant !== 'default' ? `card-${variant}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

// Header component for Card
export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

// Body component for Card
export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

// Footer component for Card
export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);

// Export as default and named
export default Card;
