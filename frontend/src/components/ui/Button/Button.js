import React from 'react';
import './Button.css';

const Button = ({ 
  variant = 'primary', 
  size = 'base', 
  icon: Icon,
  iconPosition = 'left',
  children, 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'base' ? `btn-${size}` : '';
  const iconOnlyClass = !children && Icon ? 'btn-icon' : '';
  const loadingClass = loading ? 'btn-loading' : '';
  
  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    iconOnlyClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (loading) {
      return <div className="spinner" />;
    }
    if (Icon) {
      return <Icon className="btn-icon-svg" />;
    }
    return null;
  };

  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button;
