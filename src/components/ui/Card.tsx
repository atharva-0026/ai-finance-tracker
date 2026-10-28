import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, glow = false, className = '', style, ...props }) => {
  return (
    <div
      className={`glass-card ${glow ? 'glass-card-glow' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
