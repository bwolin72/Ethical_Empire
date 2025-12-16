import React from 'react';
import '../styles/ui.css';

// Main Card Component
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
      {children}
    </div>
  );
};

// CardHeader Component
export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

// CardContent Component (this is what you're trying to import as CardContent)
export const CardContent = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

// CardFooter Component
export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);

// Optional: Also export CardBody as alias for CardContent if you want both
export const CardBody = CardContent;

// Export as default and named
export default Card;
