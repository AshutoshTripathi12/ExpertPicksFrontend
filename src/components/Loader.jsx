// src/components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    // Main overlay: fixed position, covers the whole screen, and dims the background
    <div 
      className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
      aria-label="Loading..."
      role="status"
    >
      {/* Container for the pulsing beacon animation */}
      <div className="relative flex h-16 w-16">
        {/* The outer, pulsing ring. Tailwind's 'animate-ping' creates this effect. */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        
        {/* The solid, central dot */}
        <span className="relative inline-flex rounded-full h-16 w-16 bg-indigo-500"></span>

        {/* Optional: You can place a small icon or initial in the center dot */}
        <span className="absolute inline-flex h-full w-full items-center justify-center text-yellow font-bold text-xl">
          ExpertPicks
        </span>
      </div>
    </div>
  );
};

export default Loader;