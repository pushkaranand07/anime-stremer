import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAnime, searchManga } from '../../../api/endpoints';
import { useDebounce } from '../../../hooks/useDebounce';
import AnimeCard from '../components/AnimeCard';
import SearchBar from '../../../components/ui/SearchBar';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

import '../styles/search-page.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchType = searchParams.get('type')?.toLowerCase() === 'manga' ? 'manga' : 'anime';
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchTerm, 600);

  const { data, status, isFetching } = useQuery({
    queryKey: ['search', searchType, debouncedSearch],
    queryFn: () => (searchType === 'manga' ? searchManga(debouncedSearch, 1) : searchAnime(debouncedSearch, 1)),
    enabled: debouncedSearch.length >= 3,
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) {
      const nextParams = { q: term };
      if (searchType === 'manga') nextParams.type = 'manga';
      setSearchParams(nextParams);
    } else {
      setSearchParams(searchType === 'manga' ? { type: 'manga' } : {});
    }
  };

  const isMangaSearch = searchType === 'manga';
  const pageTitle = isMangaSearch ? 'MANGA SEARCH' : 'GLOBAL SEARCH';
  const pageSubtitle = isMangaSearch
    ? 'Search across our manga database. Enter at least 3 characters to begin.'
    : 'Search across our entire database of over 25,000 anime titles. Enter at least 3 characters to begin.';
  const totalResults = data?.pagination?.items?.total ?? data?.paging?.items?.total ?? data?.data?.length ?? 0;
  const normalizedResults = (data?.data || []).map((item) => ({
    ...item,
    image: item.image || item.main_picture?.medium || item.main_picture?.large || item.images?.jpg?.image_url || '/api/placeholder/160/220',
    title: item.title || item.name || item.title_english || 'Untitled',
    episode: item.episodes ? `Vol ${item.volumes ?? item.episodes}` : item.volumes ? `Vol ${item.volumes}` : 'Manga',
  }));

  return (
    <div className="search-page-container">
      <div className="search-header">
        <h1 className="search-title">{pageTitle}</h1>
        <p className="search-subtitle">{pageSubtitle}</p>
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
                <h2 className="search-results-title">Results for "{debouncedSearch}"</h2>
                <span className="search-results-badge">{totalResults} Found</span>
              </div>

              {normalizedResults.length > 0 ? (
                <div className="search-results-grid">
                  {normalizedResults.map((anime) => (
                    <AnimeCard key={anime.id || anime.mal_id} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="search-empty-state">
                  <p>No {isMangaSearch ? 'manga' : 'anime'} found matching your search.</p>
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
