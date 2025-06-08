// src/components/ExpertCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge';

const ExpertCard = ({ expert }) => {
  if (!expert) return null;

  const { id, name, profilePhotoUrl, expertiseDescription, followersCount, userType } = expert;
  const isVerified = userType === 'EXPERT_VERIFIED' || userType === 'BRAND_VERIFIED';
  const placeholderAvatar = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(name || 'Expert')}`;

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col items-center p-6 text-center h-full transform transition-all hover:scale-105 duration-300 ease-in-out">
      <Link to={`/users/${id}`} className="block mb-4">
        <img
          className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-md"
          src={profilePhotoUrl || placeholderAvatar}
          alt={name || 'Expert'}
          onError={(e) => { if (e.target.src !== placeholderAvatar) e.target.src = placeholderAvatar; e.target.onerror = null; }}
        />
      </Link>
      
      {/* Container to enforce height for text content */}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-center space-x-1.5 mb-1 h-7">
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
            <Link to={`/users/${id}`} className="hover:text-indigo-600">{name || 'Unnamed Expert'}</Link>
          </h3>
          {isVerified && <VerifiedBadge size={5} />}
        </div>

        <div className="h-10 mb-2 flex items-center justify-center">
            {expertiseDescription && (
              <p className="text-sm text-indigo-500 font-medium line-clamp-2">{expertiseDescription}</p>
            )}
        </div>
        <p className="text-xs text-gray-500 mb-4">
          {followersCount !== undefined ? `${followersCount} Followers` : ''}
        </p>
        <Link
          to={`/users/${id}`}
          className="mt-auto w-full text-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default ExpertCard;