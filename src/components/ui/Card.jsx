import React from 'react';
import '../styles/ui.css';

const Card = ({
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

export default Card;
