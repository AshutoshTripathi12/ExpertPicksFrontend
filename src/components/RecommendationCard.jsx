// src/components/RecommendationCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge';

const RecommendationCard = ({ recommendation, onEdit, onDelete, showActionsAsAuthor }) => {
  if (!recommendation) return null;

  const { id, title, briefDescription, genre, photoUrl, authorName, authorId, authorUserType } = recommendation;
  const isVerified = authorUserType === 'EXPERT_VERIFIED' || authorUserType === 'BRAND_VERIFIED';
  const placeholderImage = `https://placehold.co/600x400/F9FAFB/CBD5E0?text=${encodeURIComponent(title || 'ExpertPicks')}&font=sans`;

  const handleImageError = (e) => {
    if (e.target.src !== placeholderImage) { e.target.src = placeholderImage; }
    e.target.onerror = null;
  };

  const cardContent = (
    <div className="bg-background border border-border-color rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col h-full group">
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
          <img className="w-full h-full object-cover object-center rounded-t-lg" src={photoUrl || placeholderImage} alt={title || 'Recommendation image'} onError={handleImageError} />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {genre && (<p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">{genre}</p>)}
        <h3 className="text-lg font-semibold text-text-main leading-tight group-hover:text-indigo-600 transition-colors h-14 line-clamp-2" title={title}>
          {title || "Untitled Recommendation"}
        </h3>
        <p className="text-sm text-text-muted my-2 flex-grow h-10 line-clamp-2">
          {briefDescription || "No description available."}
        </p>
        <div className="text-xs text-text-muted mt-auto pt-3 border-t border-border-color flex items-center space-x-1.5">
          <span>By:</span>
          <span className="font-medium text-indigo-600">{authorName || 'Anonymous'}</span>
          {isVerified && <VerifiedBadge size={4} />}
        </div>
      </div>
    </div>
  );
  
  // Conditionally render Edit/Delete buttons outside the main link for better user experience
  if (showActionsAsAuthor) {
    return (
      <div>
        <Link to={`/recommendations/${id}`} title={title}>
            {cardContent}
        </Link>
        <div className="mt-2 flex justify-end space-x-2">
            <button onClick={() => onEdit(id)} className="text-xs px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary-hover transition-colors">Edit</button>
            <button onClick={() => onDelete(id)} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    );
  }

  // Default card is a link to the detail page
  return (
    <Link to={`/recommendations/${id}`} title={title}>
      {cardContent}
    </Link>
  );
};

export default RecommendationCard;