import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getAllRecommendations } from '../services/recommendation.service';
import { getFeaturedExperts, getFeaturedRecommendations } from '../services/homepage.service';
import RecommendationCard from '../components/RecommendationCard';
import ExpertCard from '../components/ExpertCard';
import HeroCarousel from '../components/HeroCarousel';
import PaginationControls from '../components/PaginationControls';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  
  // State for the main "All Recommendations" list
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState('');
  
  // State for filters
  const [selectedGenre, setSelectedGenre] = useState('');
  const baseGenres = ['Science Fiction', 'Fantasy', 'Tech', 'Movies', 'Books', 'Lifestyle', 'Food'];
  const [genres, setGenres] = useState(baseGenres);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 12;

  // State for featured sections
  const [featuredExperts, setFeaturedExperts] = useState([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState('');

  const [featuredRecommendations, setFeaturedRecommendations] = useState([]);
  const [isLoadingFeaturedRecs, setIsLoadingFeaturedRecs] = useState(true);
  const [featuredRecsError, setFeaturedRecsError] = useState('');

  // --- Data Fetching and Handlers (from your provided code, unchanged) ---

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(0);
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedGenre]);

  const fetchRecommendations = useCallback(async () => {
    setIsLoadingRecs(true);
    setRecsError('');
    try {
      const data = await getAllRecommendations({
        genre: selectedGenre,
        keyword: debouncedSearchTerm,
        page: currentPage,
        size: PAGE_SIZE
      });
      setRecommendations(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
      setCurrentPage(data?.number || 0);
    } catch (err) {
      setRecsError('Failed to fetch recommendations.');
      console.error("Fetch recommendations error:", err.response?.data || err.message);
      setRecommendations([]);
    } finally {
      setIsLoadingRecs(false);
    }
  }, [selectedGenre, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const fetchFeaturedExperts = useCallback(async () => {
    setIsLoadingExperts(true);
    setExpertsError('');
    try {
      const data = await getFeaturedExperts({ page: 0, size: 4 }); // Using {page, size} for consistency
      const expertData = data?.content || (Array.isArray(data) ? data : []);
      setFeaturedExperts(expertData);
    } catch (err) {
      setExpertsError('Failed to fetch featured experts.');
      setFeaturedExperts([]);
    } finally {
      setIsLoadingExperts(false);
    }
  }, []);

  const fetchFeaturedRecommendations = useCallback(async () => {
    setIsLoadingFeaturedRecs(true);
    setFeaturedRecsError('');
    try {
      const data = await getFeaturedRecommendations({ page: 0, size: 4 });
      const recsData = data?.content || (Array.isArray(data) ? data : []);
      setFeaturedRecommendations(recsData);
    } catch (err) {
      setFeaturedRecsError('Failed to fetch featured recommendations.');
      setFeaturedRecommendations([]);
    } finally {
      setIsLoadingFeaturedRecs(false);
    }
  }, []);

  useEffect(() => { fetchFeaturedExperts(); }, [fetchFeaturedExperts]);
  useEffect(() => { fetchFeaturedRecommendations(); }, [fetchFeaturedRecommendations]);

  useEffect(() => {
    if (recommendations.length > 0 && !selectedGenre && !debouncedSearchTerm) {
      const uniqueGenresFromRecs = [...new Set(recommendations.map(r => r.genre).filter(g => g))].sort();
      if (uniqueGenresFromRecs.length > 0) {
        setGenres(prevGenres => [...new Set([...baseGenres, ...uniqueGenresFromRecs])].sort());
      }
    } else if (!selectedGenre && !debouncedSearchTerm && recommendations.length === 0 && !isLoadingRecs) {
      setGenres(baseGenres.sort());
    }
  }, [recommendations, selectedGenre, debouncedSearchTerm, isLoadingRecs]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const element = document.getElementById('all-recommendations-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearchTerm(searchTerm);
  };
  const clearSearch = () => setSearchTerm('');
  
  // Reusable Section Component is removed for direct JSX implementation

  return (
    <div className="bg-surface min-h-screen">
      <header className="relative bg-white animated-lines-bg border-b border-border-color">
        <HeroCarousel />
      </header>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Experts Section */}
        <section className="py-8">
          <h2 className="text-3xl font-bold text-text-main mb-6 text-center">Featured Experts</h2>
          {isLoadingExperts ? (
            <p className="text-center text-text-muted">Loading experts...</p>
          ) : expertsError ? (
            <p className="text-center text-red-600 bg-red-50 p-4 rounded-md">{expertsError}</p>
          ) : featuredExperts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredExperts.map(expert => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          ) : (
            <p className="text-center text-text-muted">No featured experts to show right now.</p>
          )}
        </section>
        
        {/* Featured Recommendations Section */}
        <section className="py-8 mt-8">
          <h2 className="text-3xl font-bold text-text-main mb-6 text-center">Featured Recommendations</h2>
          {isLoadingFeaturedRecs ? (
            <p className="text-center text-text-muted">Loading recommendations...</p>
          ) : featuredRecsError ? (
            <p className="text-center text-red-600 bg-red-50 p-4 rounded-md">{featuredRecsError}</p>
          ) : featuredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredRecommendations.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          ) : (
            <p className="text-center text-text-muted">No featured recommendations to show right now.</p>
          )}
        </section>

        {/* "Explore All Recommendations" Section */}
        <section id="all-recommendations-section" className="py-8 md:py-12 border-t border-border-color mt-8">
          <h2 className="text-3xl font-bold text-text-main mb-8 text-center">Explore All Recommendations</h2>
          
          <div className="mb-8 p-6 bg-background rounded-lg shadow-sm border border-border-color">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* <form onSubmit={handleSearchSubmit} className="md:col-span-2">
                <label htmlFor="search-keyword" className="block text-sm font-medium text-text-main mb-1">Search by Keyword</label>
                <div className="flex">
                  <input
                    type="text"
                    id="search-keyword"
                    className="flex-grow min-w-0 px-3 py-2 border border-border-color rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., sci-fi, productivity tool"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <button type="button" onClick={clearSearch} className="px-3 py-2 border border-y border-r border-border-color bg-white text-text-muted hover:bg-gray-50 text-sm rounded-none">
                      Clear
                    </button>
                  )}
                  <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Search
                  </button>
                </div>
              </form> */}
              <div>
                <label htmlFor="genre-filter" className="block text-sm font-medium text-text-main mb-1">Filter by Genre</label>
                <select
                  id="genre-filter"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border-border-color focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                >
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div>
            {isLoadingRecs ? (
              <div className="text-center py-20 text-lg text-text-muted">Loading recommendations...</div>
            ) : recsError ? (
              <div className="text-center py-20 text-lg text-red-600 bg-red-50 p-6 rounded-md shadow">{recsError}</div>
            ) : recommendations.length > 0 ? (
              <>
                <p className="text-sm text-text-muted mb-6">
                  Showing <span className="font-semibold">{recommendations.length}</span> of <span className="font-semibold">{totalElements}</span> results.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {recommendations.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
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