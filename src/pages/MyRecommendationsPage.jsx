// src/pages/MyRecommendationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecommendationsByUserId, deleteRecommendation } from '../services/recommendation.service';
import { useAuth } from '../contexts/AuthContext';
import RecommendationCard from '../components/RecommendationCard';

const MyRecommendationsPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMyRecommendations = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await getRecommendationsByUserId(user.id);
      setRecommendations(data || []);
    } catch (err) {
      setError('Failed to fetch your recommendations. Please try again later.');
      console.error("Fetch my recommendations error:", err.response?.data || err.message);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading) {
        fetchMyRecommendations();
    }
  }, [authLoading, fetchMyRecommendations]);

  const handleDelete = async (recommendationId) => {
    // This confirmation prompt is a good practice
    if (window.confirm('Are you sure you want to permanently delete this recommendation?')) {
      try {
        await deleteRecommendation(recommendationId);
        // Refresh the list by filtering out the deleted item
        setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
        alert('Recommendation deleted successfully.');
      } catch (err) {
        setError('Failed to delete recommendation.');
        alert('Error: Could not delete the recommendation. Please try again.');
      }
    }
  };

  const handleEdit = (recommendationId) => {
    // Navigate to the dedicated edit page for this recommendation
    navigate(`/edit-recommendation/${recommendationId}`);
  };


  if (authLoading || isLoading) {
    return <div className="text-center p-10 font-semibold text-lg text-text-muted">Loading your recommendations...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600 bg-red-100 p-6 rounded-md shadow">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-border-color">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 sm:mb-0">My Recommendations</h1>
        <Link
          to="/create-recommendation"
          className="w-full sm:w-auto inline-block text-center px-6 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors"
        >
          + Add New Recommendation
        </Link>
      </div>

      {recommendations.length === 0 ? (
        // --- Empty State ---
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">You haven't added any recommendations yet.</h2>
          <p className="mt-2 text-base text-gray-500">
            Click the button below to share your first pick!
          </p>
          <div className="mt-6">
            <Link to="/create-recommendation" className="inline-block px-8 py-3 bg-primary text-primary-text text-base font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 transition-colors">
              Create First Recommendation
            </Link>
          </div>
        </div>
      ) : (
        // --- Recommendations Grid ---
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActionsAsAuthor={true} // Always show Edit/Delete on this page
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecommendationsPage;