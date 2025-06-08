// src/pages/RecommendationDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecommendationById } from '../services/recommendation.service';
import VerifiedBadge from '../components/VerifiedBadge';

const RecommendationDetailPage = () => {
  const { recommendationId } = useParams(); // Gets the ID from the URL (e.g., /recommendations/123)
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendation = useCallback(async () => {
    if (!recommendationId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getRecommendationById(recommendationId);
      setRecommendation(data);
    } catch (err) {
      setError('Could not load recommendation. It may have been removed or the link is incorrect.');
      console.error("Fetch recommendation detail error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [recommendationId]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  if (isLoading) {
    return <div className="text-center p-10 font-semibold text-lg text-text-muted">Loading Recommendation...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600 bg-red-50 p-6 rounded-md shadow">{error}</div>;
  }
  
  if (!recommendation) {
    return <div className="container mx-auto px-4 py-8 text-center">Recommendation not found.</div>;
  }

  const { title, briefDescription, detailedElaboration, genre, photoUrl, affiliateLink, authorName, authorId, authorUserType, updatedAt } = recommendation;
  const isVerified = authorUserType === 'EXPERT_VERIFIED' || authorUserType === 'BRAND_VERIFIED';
  const placeholderImage = `https://placehold.co/1200x800/F9FAFB/CBD5E0?text=${encodeURIComponent(title || 'ExpertPicks')}&font=sans`;

  return (
    <div className="bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm mb-6">
            <Link to="/" className="text-text-muted hover:text-indigo-600">Home</Link>
            <span className="mx-2 text-text-muted">/</span>
            <span className="text-text-main">{title}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image Column */}
            <div>
              <img 
                src={photoUrl || placeholderImage} 
                alt={title} 
                className="w-full h-auto object-cover rounded-lg shadow-lg border border-border-color"
              />
            </div>

            {/* Details Column */}
            <div>
              {genre && <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{genre}</p>}
              <h1 className="text-3xl lg:text-4xl font-bold text-text-main mt-2 mb-4">{title}</h1>
              <p className="text-lg text-text-muted mb-6">{briefDescription}</p>

              <div className="flex items-center space-x-3 p-4 bg-surface rounded-lg border border-border-color">
                <Link to={`/users/${authorId}`}>
                  <img 
                    src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(authorName || 'User')}`} 
                    alt={authorName} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </Link>
                <div>
                  <p className="text-sm text-text-muted">Recommended by</p>
                  <div className="flex items-center space-x-1.5">
                    <Link to={`/users/${authorId}`} className="font-semibold text-text-main hover:underline">{authorName}</Link>
                    {isVerified && <VerifiedBadge size={5} />}
                  </div>
                </div>
              </div>

              {affiliateLink && (
                <a 
                  href={affiliateLink.startsWith('http') ? affiliateLink : `//${affiliateLink}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-6 w-full inline-block text-center px-8 py-3 bg-primary text-primary-text text-base font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors"
                >
                  View or Buy Product
                </a>
              )}
            </div>
          </div>
          
          {/* Detailed Elaboration Section */}
          {detailedElaboration && (
            <div className="mt-12 pt-8 border-t border-border-color">
              <h2 className="text-2xl font-bold text-text-main mb-4">Why it's recommended</h2>
              <div className="prose max-w-none text-text-muted">
                <p>{detailedElaboration}</p>
              </div>
            </div>
          )}

           <div className="mt-12 text-center text-xs text-text-muted">
             <p>Last updated on {new Date(updatedAt).toLocaleDateString()}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetailPage;