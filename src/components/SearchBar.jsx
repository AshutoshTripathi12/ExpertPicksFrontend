// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { globalSearch } from '../services/search.service';
import VerifiedBadge from './VerifiedBadge';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Hook to close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setIsDropdownOpen(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
        setIsDropdownOpen(true);
      } catch (error) {
        setResults(null);
        setIsDropdownOpen(false);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(() => search(), 400);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = () => {
    setQuery('');
    setResults(null);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <form onSubmit={(e) => e.preventDefault()} role="search">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-text-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search Experts & Recommendations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results && (results.experts.length > 0 || results.recommendations.length > 0)) setIsDropdownOpen(true); }}
            className="w-full pl-10 pr-4 py-2 text-text-main bg-surface border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </form>

      {isDropdownOpen && (
        <div className="absolute mt-2 w-full bg-background rounded-lg shadow-2xl border border-border-color z-50 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-text-muted">Searching...</div>
          ) : (
            results && (results.experts.length > 0 || results.recommendations.length > 0) ? (
              <div>
                {results.experts.length > 0 && (
                  <div className="p-2">
                    <h3 className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Experts & Brands</h3>
                    {results.experts.map(expert => (
                      <Link key={`expert-${expert.id}`} to={`/users/${expert.id}`} onClick={handleResultClick} className="flex items-center p-3 hover:bg-surface rounded-md">
                        <img src={expert.profilePhotoUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(expert.name)}`} alt={expert.name} className="w-10 h-10 rounded-full object-cover mr-3"/>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-text-main">{expert.name}</span>
                          {(expert.userType === 'EXPERT_VERIFIED' || expert.userType === 'BRAND_VERIFIED') && <VerifiedBadge size={4} />}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {results.recommendations.length > 0 && (
                  <div className="p-2 border-t border-border-color">
                    <h3 className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Recommendations</h3>
                    {results.recommendations.map(rec => (
                      <Link key={`rec-${rec.id}`} to={`/recommendations/${rec.id}`} onClick={handleResultClick} className="block p-3 hover:bg-surface rounded-md">
                        <p className="font-semibold text-text-main truncate">{rec.title}</p>
                        <p className="text-sm text-text-muted truncate">{rec.briefDescription}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-text-muted">No results found for "{query}".</div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;