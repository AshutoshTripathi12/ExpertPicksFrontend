// src/components/Button.jsx
import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) => {
  // Base styles for all buttons
  const baseStyles = 'inline-flex items-center justify-center px-6 py-2.5 border text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out';
  
  // Styles for hover and active states
  const interactionStyles = 'transform hover:-translate-y-px active:scale-[0.98]';

  // Variant-specific styles
  let variantStyles = '';
  switch (variant) {
    case 'secondary':
      variantStyles = 'bg-background border-border-color text-text-main hover:bg-surface disabled:bg-gray-100';
      break;
    case 'destructive':
      variantStyles = 'bg-red-600 border-transparent text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400';
      break;
    case 'primary':
    default:
      variantStyles = 'bg-primary border-transparent text-primary-text hover:bg-primary-hover focus:ring-primary disabled:opacity-70';
      break;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${interactionStyles} ${variantStyles} ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;