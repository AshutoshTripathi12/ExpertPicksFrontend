// src/pages/RecommendationDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecommendationById } from '../services/recommendation.service';
import VerifiedBadge from '../components/VerifiedBadge';
import Loader from '../components/Loader';
import Button from '../components/Button';

const RecommendationDetailPage = () => {
  const { recommendationId } = useParams();
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendation = useCallback(async () => {
    if (!recommendationId) {
        setError("Recommendation ID not found.");
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const data = await getRecommendationById(recommendationId);
      setRecommendation(data);
    } catch (err) {
      setError('Could not load recommendation. It may have been removed or the link is incorrect.');
    } finally {
      setIsLoading(false);
    }
  }, [recommendationId]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-600 bg-red-50 p-6 rounded-md shadow">{error}</div>;
  }
  
  if (!recommendation) {
    return <div className="container mx-auto px-4 py-16 text-center text-text-muted">Recommendation not found.</div>;
  }

  const { title, briefDescription, detailedElaboration, genre, photoUrl, affiliateLink, authorName, authorId, authorUserType, updatedAt } = recommendation;
  const isVerified = authorUserType === 'EXPERT_VERIFIED' || authorUserType === 'BRAND_VERIFIED';
  const placeholderImage = `https://placehold.co/1200x800/F9FAFB/CBD5E0?text=${encodeURIComponent(title || 'ExpertPicks')}&font=sans`;

  return (
    <div className="bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="text-sm mb-8">
            <Link to="/" className="text-text-muted hover:text-indigo-600 transition-colors">Home</Link>
            <span className="mx-2 text-text-muted">/</span>
            <span className="text-text-main font-medium truncate">{title}</span>
          </nav>

          {/* Main Content Grid (Image + Details) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image Column */}
            <div className="w-full">
              <div className="aspect-w-1 aspect-h-1 bg-surface rounded-lg shadow-lg border border-border-color overflow-hidden">
                <img 
                  src={photoUrl || placeholderImage} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  onError={(e) => { if (e.target.src !== placeholderImage) e.target.src = placeholderImage; e.target.onerror = null; }}
                />
              </div>
            </div>

            {/* Details Column */}
            <div className="flex flex-col">
              {genre && <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{genre}</p>}
              <h1 className="text-3xl lg:text-4xl font-bold text-text-main mt-2 mb-4">{title}</h1>
              <p className="text-lg text-text-muted mb-6">{briefDescription}</p>

              <div className="flex items-center space-x-4 p-4 bg-surface rounded-lg border border-border-color my-4">
                <Link to={`/users/${authorId}`}>
                  <img 
                    src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(authorName || 'User')}`} 
                    alt={authorName} 
                    className="w-14 h-14 rounded-full object-cover shadow-sm"
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
                  className="mt-6 w-full"
                >
                  <Button variant="primary" className="w-full !py-4 !text-base">
                    View or Buy Product
                  </Button>
                </a>
              )}
            </div>
          </div>
          
          {/* Detailed Elaboration Section */}
          {detailedElaboration && (
            <div className="mt-12 pt-8 border-t border-border-color">
              <h2 className="text-2xl font-bold text-text-main mb-4">Why It's Recommended</h2>
              <div className="prose prose-lg max-w-none text-text-muted">
                {/* Split text by newlines and render as paragraphs for better formatting */}
                {detailedElaboration.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
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