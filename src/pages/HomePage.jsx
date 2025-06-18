import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getAllRecommendations } from '../services/recommendation.service';
import { getFeaturedExperts, getFeaturedRecommendations } from '../services/homepage.service';
import { getAllGenres } from '../services/genre.service';
import RecommendationCard from '../components/RecommendationCard';
import ExpertCard from '../components/ExpertCard';
import HeroCarousel from '../components/HeroCarousel';
import PaginationControls from '../components/PaginationControls';
import Loader from '../components/Loader';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState('');
  
  const [featuredExperts, setFeaturedExperts] = useState([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState('');

  const [featuredRecommendations, setFeaturedRecommendations] = useState([]);
  const [isLoadingFeaturedRecs, setIsLoadingFeaturedRecs] = useState(true);
  const [featuredRecsError, setFeaturedRecsError] = useState('');

  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // --- Data Fetching Logic ---

  useEffect(() => {
    const handler = setTimeout(() => { setCurrentPage(0); setDebouncedSearchTerm(searchTerm); }, 500);
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
        size: 12
      });
      setRecommendations(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
      // CORRECTED: Do NOT set currentPage here, as it creates a loop. 
      // It's only set by user actions (clicking pagination, changing filters).
    } catch (err) {
      setRecsError('Failed to fetch recommendations.');
    } finally {
      setIsLoadingRecs(false);
    }
  }, [selectedGenre, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    // Initial data fetches for featured content and genres
    const fetchInitialData = async () => {
      try {
        const [expertData, recData, genresData] = await Promise.all([
          getFeaturedExperts({ page: 0, size: 4 }),
          getFeaturedRecommendations({ page: 0, size: 4 }),
          getAllGenres()
        ]);
        setFeaturedExperts(expertData?.content || (Array.isArray(expertData) ? expertData : []));
        setFeaturedRecommendations(recData?.content || (Array.isArray(recData) ? recData : []));
        setGenres(genresData || []);
      } catch (err) {
        console.error("Failed to load initial page data", err);
        setExpertsError('Failed to load featured sections.');
      } finally {
        setIsLoadingExperts(false);
        setIsLoadingFeaturedRecs(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const element = document.getElementById("all-recommendations-section");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchSubmit = (e) => { e.preventDefault(); setDebouncedSearchTerm(searchTerm); };
  const clearSearch = () => setSearchTerm('');

  const isPageLoading = isLoadingExperts || isLoadingFeaturedRecs;

  return (
    <div className="bg-surface min-h-screen">
      {isPageLoading && <Loader />}
      
      <div className={`transition-opacity duration-500 ${isPageLoading ? 'opacity-0' : 'opacity-100'}`}>
        <header className="relative bg-white animated-lines-bg border-b border-border-color">
          <HeroCarousel />
        </header>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <section className="py-6 md:py-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-6 text-center">Featured Experts</h2>
            {expertsError && <p className="text-center text-red-600 p-4">{expertsError}</p>}
            {featuredExperts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredExperts.map(expert => (<ExpertCard key={expert.id} expert={expert} />))}
              </div>
            )}
          </section>
          
          <section className="py-6 md:py-10 mt-6 border-t border-border-color">
            <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-6 text-center">Featured Recommendations</h2>
            {featuredRecsError && <p className="text-center text-red-600 p-4">{featuredRecsError}</p>}
            {featuredRecommendations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredRecommendations.map(rec => (<RecommendationCard key={rec.id} recommendation={rec} />))}
              </div>
            )}
          </section>

          <section id="all-recommendations-section" className="py-6 md:py-10 border-t border-border-color mt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-text-main mb-6 text-center">Explore All Recommendations</h2>
            <div className="mb-8 p-4 md:p-6 bg-background rounded-lg shadow-sm border border-border-color">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
                <form onSubmit={handleSearchSubmit} className="md:col-span-2">
                  <label htmlFor="search-keyword" className="block text-sm font-medium text-text-main mb-1">Search by Keyword</label>
                  <div className="flex">
                    <input type="text" id="search-keyword" value={searchTerm} onChange={handleSearchChange} className="flex-grow min-w-0 px-3 py-2 border border-border-color rounded-l-md shadow-sm" placeholder="Search all picks..."/>
                    {searchTerm && ( <button type="button" onClick={clearSearch} className="px-3 py-2 border border-y border-r border-border-color bg-white text-text-muted hover:bg-gray-50 text-sm">Clear</button> )}
                    <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Search</button>
                  </div>
                </form>
                <div>
                  <label htmlFor="genre-filter" className="block text-sm font-medium text-text-main mb-1">Filter by Genre</label>
                  <select id="genre-filter" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="block w-full pl-3 pr-10 py-2.5 text-base border-border-color rounded-md shadow-sm">
                    <option value="">All Genres</option>
                    {genres.map(genre => (<option key={genre.id} value={genre.name}>{genre.name}</option>))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              {isLoadingRecs ? ( <div className="text-center py-20 text-lg text-text-muted">Loading...</div> ) : 
               recsError ? ( <div className="text-center py-20 text-lg text-red-600">{recsError}</div> ) : 
               recommendations.length > 0 ? (
                <>
                  <p className="text-sm text-text-muted mb-6">Showing {recommendations.length} of {totalElements} results.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendations.map((rec) => ( <RecommendationCard key={rec.id} recommendation={rec} /> ))}
                  </div>
                  <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
               ) : (
                <div className="text-center py-20">
                  <h2 className="text-xl font-semibold text-gray-700">No recommendations match your criteria.</h2>
                  <p className="mt-2 text-sm text-gray-500">Try a different search or filter.</p>
                </div>
               )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;