// src/pages/EditRecommendationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecommendationById, updateRecommendation } from '../services/recommendation.service';
import { getAllGenres } from '../services/genre.service';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Loader from '../components/Loader';

const EditRecommendationPage = () => {
  const { recommendationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '', briefDescription: '', detailedElaboration: '', genreId: '',
    photoUrl: '', affiliateLink: '',
  });
  const [genres, setGenres] = useState([]);
  const [originalAuthorId, setOriginalAuthorId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInitialData = useCallback(async () => {
    if (!recommendationId) {
      setError("No recommendation ID provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [recData, genresData] = await Promise.all([
        getRecommendationById(recommendationId),
        getAllGenres()
      ]);
      
      setGenres(genresData || []);

      if (recData) {
        const currentGenre = genresData.find(g => g.name === recData.genre);
        setFormData({
          title: recData.title || '',
          briefDescription: recData.briefDescription || '',
          detailedElaboration: recData.detailedElaboration || '',
          genreId: currentGenre ? currentGenre.id : '',
          photoUrl: recData.photoUrl || '',
          affiliateLink: recData.affiliateLink || '',
        });
        setOriginalAuthorId(recData.authorId);
      } else {
        setError("Recommendation not found.");
      }
    } catch (err) {
      setError('Failed to fetch recommendation details.');
    } finally {
      setIsLoading(false);
    }
  }, [recommendationId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.id !== originalAuthorId) { return alert("Permission Denied."); }
    if (!formData.title.trim() || !formData.briefDescription.trim() || !formData.genreId) {
      setError('Title, Brief Description, and Genre are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateRecommendation(recommendationId, formData);
      alert('Recommendation updated successfully!');
      navigate('/my-recommendations');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update recommendation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) { return <Loader />; }
  if (error && !formData.title) { return <div className="text-center p-10 text-red-600">{error}</div>; }

  return (
    <div className="bg-surface py-12 px-4 sm:px-6 lg:px-8">
      {isSubmitting && <Loader />}
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text-main">Edit Your Recommendation</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-background shadow-xl rounded-lg p-6 md:p-8 space-y-6 border border-border-color">
          {/* Form fields are identical to Create page, just populated with existing data */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-text-main">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="briefDescription" className="block text-sm font-semibold text-text-main">Brief Description <span className="text-red-500">*</span></label>
            <textarea name="briefDescription" id="briefDescription" rows="3" value={formData.briefDescription} onChange={handleChange} required className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="detailedElaboration" className="block text-sm font-semibold text-text-main">Detailed Elaboration</label>
            <textarea name="detailedElaboration" id="detailedElaboration" rows="6" value={formData.detailedElaboration} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-color">
            <div>
              <label htmlFor="genreId" className="block text-sm font-semibold text-text-main">Genre / Category <span className="text-red-500">*</span></label>
              <select id="genreId" name="genreId" value={formData.genreId} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-3 border border-border-color rounded-md shadow-sm">
                <option value="" disabled>-- Select a Genre --</option>
                {genres.map(genre => (<option key={genre.id} value={genre.id}>{genre.name}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="photoUrl" className="block text-sm font-semibold text-text-main">Photo URL</label>
              <input type="url" name="photoUrl" id="photoUrl" value={formData.photoUrl} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
            </div>
          </div>
          <div>
            <label htmlFor="affiliateLink" className="block text-sm font-semibold text-text-main">Affiliate Link</label>
            <input type="url" name="affiliateLink" id="affiliateLink" value={formData.affiliateLink} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
          </div>
          {error && <div className="rounded-md bg-red-100 p-4 text-center text-sm font-medium text-red-800">{error}</div>}
          <div className="pt-5 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/my-recommendations')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecommendationPage;