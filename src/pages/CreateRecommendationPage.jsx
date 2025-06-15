// src/pages/CreateRecommendationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecommendation } from '../services/recommendation.service';
import { getAllGenres } from '../services/genre.service'; // Import new genre service
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Loader from '../components/Loader';

const CreateRecommendationPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    briefDescription: '',
    detailedElaboration: '',
    genreId: '', // Changed from 'genre' to 'genreId'
    photoUrl: '',
    affiliateLink: '',
  });
  
  const [genres, setGenres] = useState([]); // State to hold the list of genres from the API
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch the list of available genres when the page loads
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getAllGenres();
        setGenres(genresData || []);
      } catch (err) {
        setError("Could not load genre options. Please try refreshing.");
      }
    };
    fetchGenres();
  }, []); // Empty array ensures this runs only once

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.briefDescription.trim() || !formData.genreId) {
      setError('Title, Brief Description, and Genre are required.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await createRecommendation(formData);
      alert('Recommendation created successfully!');
      navigate('/my-recommendations');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create recommendation.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface py-12 px-4 sm:px-6 lg:px-8">
      {isLoading && <Loader />}
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-text-main">Share a New Recommendation</h1>
            <p className="mt-2 text-text-muted">Fill out the details below to add your pick.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-background shadow-xl rounded-lg p-6 md:p-8 space-y-6 border border-border-color">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-text-main">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="briefDescription" className="block text-sm font-semibold text-text-main">Brief Description <span className="text-red-500">*</span></label>
            <textarea name="briefDescription" id="briefDescription" rows="3" value={formData.briefDescription} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="detailedElaboration" className="block text-sm font-semibold text-text-main">Detailed Elaboration (Optional)</label>
            <textarea name="detailedElaboration" id="detailedElaboration" rows="6" value={formData.detailedElaboration} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-color">
            <div>
              <label htmlFor="genreId" className="block text-sm font-semibold text-text-main">Genre / Category <span className="text-red-500">*</span></label>
              <select
                id="genreId"
                name="genreId"
                value={formData.genreId}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>-- Select a Genre --</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="photoUrl" className="block text-sm font-semibold text-text-main">Photo URL (Optional)</label>
              <input type="url" name="photoUrl" id="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
            </div>
          </div>

          <div>
            <label htmlFor="affiliateLink" className="block text-sm font-semibold text-text-main">Affiliate Link (Optional)</label>
            <input type="url" name="affiliateLink" id="affiliateLink" value={formData.affiliateLink} onChange={handleChange} placeholder="https://amazon.com/product-link" className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          
          {error && <div className="rounded-md bg-red-100 p-4 text-center text-sm font-medium text-red-800">{error}</div>}

          <div className="pt-5 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Recommendation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecommendationPage;