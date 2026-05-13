import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAnime } from '../api/endpoints';
import { useDebounce } from '../hooks/useDebounce';
import AnimeCard from '../components/anime/AnimeCard';
import SearchBar from '../components/ui/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
    <div className="py-20 min-h-screen max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-white tracking-tight">GLOBAL SEARCH</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Search across our entire database of over 25,000 anime titles. 
          Enter at least 3 characters to begin.
        </p>
      </div>

      <SearchBar value={searchTerm} onChange={handleSearch} />

      {debouncedSearch.length >= 3 && (
        <div className="mt-12">
          {status === 'pending' || isFetching ? (
            <LoadingSpinner />
          ) : status === 'error' ? (
            <div className="text-center text-red-500 py-10">An error occurred while searching.</div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-2xl font-bold text-white">
                  Results for "{debouncedSearch}"
                </h2>
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm font-bold rounded-full border border-yellow-500/20">
                  {data?.pagination?.items?.total || 0} Found
                </span>
              </div>

              {data?.data?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {data.data.map(anime => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <p className="text-gray-400 text-lg">No anime found matching your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {debouncedSearch.length > 0 && debouncedSearch.length < 3 && (
        <div className="text-center py-20 text-gray-500 italic">
          Keep typing... search requires at least 3 characters.
        </div>
      )}
      
      {debouncedSearch.length === 0 && (
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale">
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 h-64 flex items-end">
              <span className="text-4xl font-black">ACTION</span>
           </div>
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 h-64 flex items-end">
              <span className="text-4xl font-black">ROMANCE</span>
           </div>
           <div className="p-8 rounded-3xl bg-white/5 border border-white/10 h-64 flex items-end">
              <span className="text-4xl font-black">DRAMA</span>
           </div>
        </div>
      )}
    </div>
  );
}
