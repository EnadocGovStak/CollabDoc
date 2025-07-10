import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  className = '', 
  hoverable = false,
  padding = 'normal',
  ...props 
}) => {
  const baseClass = 'card';
  const hoverClass = hoverable ? 'card-hoverable' : '';
  const paddingClass = padding !== 'normal' ? `card-padding-${padding}` : '';
  
  const classes = [
    baseClass,
    hoverClass,
    paddingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => (
  <Component className={`card-title ${className}`} {...props}>
    {children}
  </Component>
);

const CardSubtitle = ({ children, className = '', ...props }) => (
  <div className={`card-subtitle ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;

export default Card;
