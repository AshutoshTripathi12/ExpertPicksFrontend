// src/components/VerifiedBadge.jsx
import React from 'react';

const VerifiedBadge = ({ size = 6 }) => {
  const sizeClasses = `h-${size} w-${size}`; // e.g., h-6 w-6

  return (
    <div 
      className="inline-flex items-center justify-center" 
      title="Verified"
    >
      <svg 
        className={`text-indigo-600 ${sizeClasses}`} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        aria-hidden="true"
      >
        <path 
          fillRule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  );
};

export default VerifiedBadge;