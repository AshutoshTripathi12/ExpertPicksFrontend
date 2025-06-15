import React from 'react';
import { Link } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge'; // We need this for the checkmark
import Button from './Button'; // We can use our new Button component for Edit/Delete

const RecommendationCard = ({ recommendation, onEdit, onDelete, showActionsAsAuthor }) => {
  if (!recommendation) {
    return null;
  }

  // Destructure all needed properties from the recommendation object
  const {
    id,
    title,
    briefDescription,
    genre,
    photoUrl,
    authorName,
    authorId,
    authorUserType
  } = recommendation;
  
  const isVerified = authorUserType === 'EXPERT_VERIFIED' || authorUserType === 'BRAND_VERIFIED';
  const placeholderImage = `https://placehold.co/600x400/F9FAFB/CBD5E0?text=${encodeURIComponent(title || 'ExpertPicks')}&font=sans`;

  const handleImageError = (e) => {
    // Prevents an infinite loop if the placeholder image itself fails
    if (e.target.src !== placeholderImage) {
      e.target.src = placeholderImage;
    }
    e.target.onerror = null;
  };

  // This is the JSX for the visual card itself
  const cardContent = (
    <div className="bg-background border border-border-color rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col h-full group">
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
          <img
            className="w-full h-full object-cover object-center rounded-t-lg"
            src={photoUrl || placeholderImage}
            alt={title || 'Recommendation image'}
            onError={handleImageError}
          />
        </div>
      </div>
      
      {/* Text Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {genre && (
          <p className="text-xs text-text-muted uppercase font-medium tracking-wider mb-1">{genre}</p>
        )}
        <h3 className="text-lg font-semibold text-text-main leading-tight group-hover:text-indigo-600 transition-colors h-14 line-clamp-2" title={title}>
          {title || "Untitled Recommendation"}
        </h3>
        <p className="text-sm text-text-muted my-2 flex-grow h-10 line-clamp-2">
          {briefDescription || "No description available."}
        </p>
        
        {/* Author Info at the bottom */}
        <div className="text-xs text-text-muted mt-auto pt-3 border-t border-border-color flex items-center space-x-1.5">
          <span>By:</span>
          <Link to={`/users/${authorId}`} className="font-medium text-indigo-600 hover:underline" onClick={(e) => e.stopPropagation()}>
            {authorName || 'Anonymous'}
          </Link>
          {isVerified && <VerifiedBadge size={4} />}
        </div>
      </div>
    </div>
  );
  
  // If the card is for the author's own page, we render the card as a link
  // AND the buttons separately underneath.
  if (showActionsAsAuthor) {
    return (
      <div>
        <Link to={`/recommendations/${id}`} title={title} className="block">
            {cardContent}
        </Link>
        <div className="mt-2 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => onEdit(id)} className="px-3 py-1 text-xs">Edit</Button>
            <Button variant="destructive" onClick={() => onDelete(id)} className="px-3 py-1 text-xs">Delete</Button>
        </div>
      </div>
    );
  }

  // By default, the entire card is a single link to the detail page.
  return (
    <Link to={`/recommendations/${id}`} title={title} className="block h-full">
      {cardContent}
    </Link>
  );
};

export default RecommendationCard;