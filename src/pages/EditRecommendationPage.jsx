// src/pages/EditRecommendationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecommendationById, updateRecommendation } from '../services/recommendation.service';
import { useAuth } from '../contexts/AuthContext';

const EditRecommendationPage = () => {
  const { recommendationId } = useParams(); // Get ID from URL
  const [formData, setFormData] = useState({
    title: '',
    briefDescription: '',
    detailedElaboration: '',
    genre: '',
    photoUrl: '',
    affiliateLink: '',
  });
  const [originalAuthorId, setOriginalAuthorId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start true to load data
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const fetchRecommendation = useCallback(async () => {
    if (!recommendationId) {
      setError("No recommendation ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getRecommendationById(recommendationId);
      if (data) {
        setFormData({
          title: data.title || '',
          briefDescription: data.briefDescription || '',
          detailedElaboration: data.detailedElaboration || '',
          genre: data.genre || '',
          photoUrl: data.photoUrl || '',
          affiliateLink: data.affiliateLink || '',
        });
        setOriginalAuthorId(data.authorId); // Store original author ID for permission check
      } else {
        setError("Recommendation not found.");
      }
    } catch (err) {
      setError('Failed to fetch recommendation details.');
      console.error("Fetch recommendation error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [recommendationId]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  // Security check after data is loaded
  useEffect(() => {
    if (!isLoading && originalAuthorId && isAuthenticated && user?.id !== originalAuthorId) {
      alert("Access Denied: You can only edit your own recommendations.");
      navigate('/my-recommendations'); // Or homepage
    }
  }, [isLoading, originalAuthorId, isAuthenticated, user, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        setError("You must be logged in to edit a recommendation.");
        return;
    }
    if (user?.id !== originalAuthorId) {
        setError("Permission Denied: You cannot edit this recommendation.");
        alert("Permission Denied.");
        return;
    }
    if (!formData.title.trim() || !formData.briefDescription.trim()) {
      setError('Title and Brief Description are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateRecommendation(recommendationId, formData);
      setSuccessMessage('Recommendation updated successfully!');
      setTimeout(() => {
        navigate('/my-recommendations'); // Redirect to my recommendations page
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update recommendation. Please try again.';
      setError(errorMessage);
      console.error("Update recommendation error:", err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading recommendation for editing...</div>;
  }

  if (error && !formData.title) { // If error and form never loaded
    return <div className="container mx-auto px-4 py-8 max-w-2xl text-center text-red-600">{error}</div>;
  }

  // Additional check for non-owner, though useEffect handles redirect
  if (isAuthenticated && user?.id !== originalAuthorId && originalAuthorId !== null) {
    return <div className="container mx-auto px-4 py-8 max-w-2xl text-center text-red-600">You do not have permission to edit this recommendation.</div>;
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Edit Recommendation</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-8 space-y-6">
        {/* Form fields are identical to CreateRecommendationPage, just pre-filled */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="briefDescription" className="block text-sm font-medium text-gray-700">Brief Description <span className="text-red-500">*</span></label>
          <textarea
            name="briefDescription"
            id="briefDescription"
            rows="3"
            value={formData.briefDescription}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="detailedElaboration" className="block text-sm font-medium text-gray-700">Detailed Elaboration (Optional)</label>
          <textarea
            name="detailedElaboration"
            id="detailedElaboration"
            rows="5"
            value={formData.detailedElaboration}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre/Category</label>
          <input
            type="text"
            name="genre"
            id="genre"
            value={formData.genre}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">Photo URL (Optional)</label>
          <input
            type="url"
            name="photoUrl"
            id="photoUrl"
            value={formData.photoUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700">Affiliate Link (Optional)</label>
          <input
            type="url"
            name="affiliateLink"
            id="affiliateLink"
            value={formData.affiliateLink}
            onChange={handleChange}
            placeholder="https://amazon.com/product-link"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 my-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 my-3">
            <p className="text-sm font-medium text-green-700">{successMessage}</p>
          </div>
        )}

        <div className="pt-2 flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/my-recommendations')} // Or navigate(-1) to go back
            disabled={isSubmitting}
            className="w-1/2 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecommendationPage;