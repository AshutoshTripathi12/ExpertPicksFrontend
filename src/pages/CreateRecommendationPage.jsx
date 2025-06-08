// src/pages/CreateRecommendationPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRecommendation } from '../services/recommendation.service';
import { useAuth } from '../contexts/AuthContext';

const CreateRecommendationPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    briefDescription: '',
    detailedElaboration: '',
    genre: '',
    photoUrl: '',
    affiliateLink: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        setError("You must be logged in to create a recommendation.");
        return;
    }
    if (!formData.title.trim() || !formData.briefDescription.trim()) {
      setError('Title and Brief Description are required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const newRecommendation = await createRecommendation(formData);
      setSuccessMessage(`Recommendation "${newRecommendation.title}" created successfully! Redirecting...`);
      setFormData({ title: '', briefDescription: '', detailedElaboration: '', genre: '', photoUrl: '', affiliateLink: '' });
      
      setTimeout(() => {
        navigate('/my-recommendations'); // Redirect to user's recommendations page
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create recommendation.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-text-main">Share a New Recommendation</h1>
            <p className="mt-2 text-text-muted">Fill out the details below to add your pick.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-background shadow-xl rounded-lg p-6 md:p-8 space-y-6 border border-border-color">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-text-main">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="briefDescription" className="block text-sm font-semibold text-text-main">Brief Description <span className="text-red-500">*</span></label>
            <p className="text-xs text-text-muted mb-1">A short, catchy summary.</p>
            <textarea
              name="briefDescription"
              id="briefDescription"
              rows="3"
              value={formData.briefDescription}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="detailedElaboration" className="block text-sm font-semibold text-text-main">Detailed Elaboration (Optional)</label>
            <p className="text-xs text-text-muted mb-1">Go into more detail about why you recommend this.</p>
            <textarea
              name="detailedElaboration"
              id="detailedElaboration"
              rows="6"
              value={formData.detailedElaboration}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-color">
            <div>
              <label htmlFor="genre" className="block text-sm font-semibold text-text-main">Genre / Category</label>
              <input
                type="text"
                name="genre"
                id="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="e.g., Book, Movie, Tech Gadget"
                className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="photoUrl" className="block text-sm font-semibold text-text-main">Photo URL (Optional)</label>
              <input
                type="url"
                name="photoUrl"
                id="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="affiliateLink" className="block text-sm font-semibold text-text-main">Affiliate Link (Optional)</label>
            <input
              type="url"
              name="affiliateLink"
              id="affiliateLink"
              value={formData.affiliateLink}
              onChange={handleChange}
              placeholder="https://amazon.com/product-link"
              className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isLoading}
            />
          </div>
          
          {error && <div className="rounded-md bg-red-100 p-4 text-center text-sm font-medium text-red-800">{error}</div>}
          {successMessage && <div className="rounded-md bg-green-100 p-4 text-center text-sm font-medium text-green-800">{successMessage}</div>}

          <div className="pt-5">
            <div className="flex justify-end">
              <Link to="/" type="button" className="bg-background py-2 px-4 border border-border-color rounded-md shadow-sm text-sm font-medium text-text-main hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-text bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              >
                {isLoading ? 'Submitting...' : 'Submit Recommendation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecommendationPage;