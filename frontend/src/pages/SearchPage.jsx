import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAnime } from '../api/endpoints';
import { useDebounce } from '../hooks/useDebounce';
import AnimeCard from '../components/anime/AnimeCard';
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import '../styles/search-page.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchTerm, 600);

  const { data, status, isFetching } = useQuery({
    queryKey: ['anime', 'search', debouncedSearch],
    queryFn: () => searchAnime(debouncedSearch, 1),
    enabled: debouncedSearch.length >= 3,
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) setSearchParams({ q: term });
    else setSearchParams({});
  };

  return (
    <div className="search-page-container">
      <div className="search-header">
        <h1 className="search-title">GLOBAL SEARCH</h1>
        <p className="search-subtitle">
          Search across our entire database of over 25,000 anime titles. 
          Enter at least 3 characters to begin.
        </p>
      </div>

      <SearchBar value={searchTerm} onChange={handleSearch} />

      {debouncedSearch.length >= 3 && (
        <div className="search-results-section">
          {status === 'pending' || isFetching ? (
            <LoadingSpinner />
          ) : status === 'error' ? (
            <div className="text-center text-red-500 py-10">An error occurred while searching.</div>
          ) : (
            <>
              <div className="search-results-header">
                <h2 className="search-results-title">
                  Results for "{debouncedSearch}"
                </h2>
                <span className="search-results-badge">
                  {data?.pagination?.items?.total || 0} Found
                </span>
              </div>

              {data?.data?.length > 0 ? (
                <div className="search-results-grid">
                  {data.data.map(anime => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="search-empty-state">
                   <p>No anime found matching your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {debouncedSearch.length > 0 && debouncedSearch.length < 3 && (
        <div className="search-typing-state">
          Keep typing... search requires at least 3 characters.
        </div>
      )}
      
      {debouncedSearch.length === 0 && (
        <div className="search-placeholder-grid">
           <div className="search-placeholder-card">
              <span>ACTION</span>
           </div>
           <div className="search-placeholder-card">
              <span>ROMANCE</span>
           </div>
           <div className="search-placeholder-card">
              <span>DRAMA</span>
           </div>
        </div>
      )}
    </div>
  );
}
