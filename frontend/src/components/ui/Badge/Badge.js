import React from 'react';
import './Badge.css';

const Badge = ({ 
  variant = 'neutral', 
  size = 'base',
  icon: Icon,
  children, 
  className = '', 
  ...props 
}) => {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;
  const sizeClass = size !== 'base' ? `badge-${size}` : '';
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {Icon && <Icon className="badge-icon" />}
      {children}
    </span>
  );
};

export default Badge;
