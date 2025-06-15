// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getAllRecommendations } from '../services/recommendation.service';
import { getFeaturedExperts, getFeaturedRecommendations } from '../services/homepage.service';
import { getAllGenres } from '../services/genre.service'; // Import the genre service
import RecommendationCard from '../components/RecommendationCard';
import ExpertCard from '../components/ExpertCard';
import HeroCarousel from '../components/HeroCarousel';
import { Loader } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  
  // State for all data sections
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState('');
  
  const [featuredExperts, setFeaturedExperts] = useState([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState('');

  const [featuredRecommendations, setFeaturedRecommendations] = useState([]);
  const [isLoadingFeaturedRecs, setIsLoadingFeaturedRecs] = useState(true);
  const [featuredRecsError, setFeaturedRecsError] = useState('');

  // State for filters
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [genres, setGenres] = useState([]); // Will be fetched from the API

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Data fetching for the main recommendations list
  const fetchRecommendations = useCallback(async () => {
    setIsLoadingRecs(true);
    setRecsError('');
    try {
      // Pass the genre name string to the service
      const data = await getAllRecommendations(selectedGenre, debouncedSearchTerm);
      setRecommendations(data || []);
    } catch (err) {
      setRecsError('Failed to fetch recommendations.');
    } finally {
      setIsLoadingRecs(false);
    }
  }, [selectedGenre, debouncedSearchTerm]);

  // Fetch initial data on component mount
  useEffect(() => {
    // Fetch featured content
    const fetchFeatured = async () => {
      setIsLoadingExperts(true);
      setIsLoadingFeaturedRecs(true);
      try {
        const [expertData, recData] = await Promise.all([
          getFeaturedExperts({ limit: 4 }),
          getFeaturedRecommendations({ limit: 4 })
        ]);
        setFeaturedExperts(expertData || []);
        setFeaturedRecommendations(recData || []);
      } catch (err) {
        setExpertsError('Failed to load featured content.');
      } finally {
        setIsLoadingExperts(false);
        setIsLoadingFeaturedRecs(false);
      }
    };

    // Fetch genres for the filter dropdown
    const fetchGenres = async () => {
        try {
            const genresData = await getAllGenres();
            setGenres(genresData || []);
        } catch (err) {
            console.error("Could not load genres for the filter.");
        }
    };

    fetchFeatured();
    fetchGenres();
  }, []);

  // Effect to re-fetch main recommendations when filters change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);
  
  const handleSearchSubmit = (e) => { e.preventDefault(); setDebouncedSearchTerm(searchTerm); };
  const clearSearch = () => setSearchTerm('');

  return (
    <div className="bg-surface min-h-screen">
      <header className="relative bg-white animated-lines-bg border-b border-border-color">
        <HeroCarousel />
      </header>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- Featured Experts Section --- */}
        <section className="py-8">
          <h2 className="text-3xl font-bold text-text-main mb-6 text-center">Featured Experts</h2>
          {isLoadingExperts ? (
            <Loader className="mx-auto animate-spin text-indigo-600 h-10 w-10" />
          ) : expertsError ? (
            <p className="text-center text-red-600 bg-red-50 p-4 rounded-md">{expertsError}</p>
          ) : featuredExperts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredExperts.map(expert => ( <ExpertCard key={expert.id} expert={expert} /> ))}
            </div>
          ) : ( <p className="text-center text-text-muted">No featured experts to show right now.</p> )}
        </section>
        
        {/* --- Featured Recommendations Section --- */}
        <section className="py-8 mt-8">
          <h2 className="text-3xl font-bold text-text-main mb-6 text-center">Featured Recommendations</h2>
          {isLoadingFeaturedRecs ? (
           <Loader className="mx-auto animate-spin text-indigo-600 h-10 w-10" />
          ) : featuredRecsError ? (
            <p className="text-center text-red-600 bg-red-50 p-4 rounded-md">{featuredRecsError}</p>
          ) : featuredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredRecommendations.map(rec => ( <RecommendationCard key={rec.id} recommendation={rec} /> ))}
            </div>
          ) : ( <p className="text-center text-text-muted">No featured recommendations to show right now.</p> )}
        </section>

        {/* --- "Explore All Recommendations" Section --- */}
        <section id="all-recommendations-section" className="py-8 md:py-12 border-t border-border-color mt-8">
          <h2 className="text-3xl font-bold text-text-main mb-8 text-center">Explore All Recommendations</h2>
          <div className="mb-8 p-6 bg-background rounded-lg shadow-sm border border-border-color">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <form onSubmit={handleSearchSubmit} className="md:col-span-2">
                <label htmlFor="search-keyword" className="block text-sm font-medium text-text-main mb-1">Search by Keyword</label>
                <div className="flex">
                  <input type="text" id="search-keyword" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow min-w-0 px-3 py-2 border border-border-color rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., sci-fi, productivity tool"/>
                  {searchTerm && ( <button type="button" onClick={clearSearch} className="px-3 py-2 border border-y border-r border-border-color bg-white text-text-muted hover:bg-gray-50 text-sm rounded-none">Clear</button> )}
                  <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Search</button>
                </div>
              </form>
              <div>
                <label htmlFor="genre-filter" className="block text-sm font-medium text-text-main mb-1">Filter by Genre</label>
                <select id="genre-filter" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="block w-full pl-3 pr-10 py-2.5 text-base border-border-color focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
                  <option value="">All Genres</option>
                  {/* The dropdown is now populated with data from your database */}
                  {genres.map(genre => (<option key={genre.id} value={genre.name}>{genre.name}</option>))}
                </select>
              </div>
            </div>
          </div>
          
          <div>
            {isLoadingRecs ? (  <Loader className="mx-auto animate-spin text-indigo-600 h-10 w-10" /> ) : 
             recsError ? ( <div className="text-center py-20 text-lg text-red-600 bg-red-50 p-6 rounded-md shadow">{recsError}</div> ) : 
             recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {recommendations.map((rec) => ( <RecommendationCard key={rec.id} recommendation={rec} /> ))}
              </div>
             ) : (
              <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-700">No recommendations match your criteria.</h2>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>
             )}
          </div>
        </section>
 
      </div>
    </div>
  );
};

export default HomePage;