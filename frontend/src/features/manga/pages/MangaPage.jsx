import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { mangaService } from '../services/mangaService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const MANGA_PROVIDERS = ['MangaPill', 'Mangahook', 'MangaKakalot', 'MangaDex'];

export default function MangaPage() {
  const [searchQuery, setSearchQuery] = useState('Solo Leveling'); // Default trending manga
  const [inputValue, setInputValue] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('MangaPill');

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['manga-search', searchQuery, selectedProvider],
    queryFn: () => mangaService.searchManga(searchQuery, selectedProvider),
    enabled: !!searchQuery,
  });

  const cleanTitle = (title) => {
    if (!title) return '';
    // Fix MangaPill double title glitch (e.g. "TitleTitle")
    const mid = Math.floor(title.length / 2);
    const firstHalf = title.substring(0, mid);
    const secondHalf = title.substring(mid);
    if (firstHalf === secondHalf) return firstHalf;
    return title;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black px-4 sm:px-6 lg:px-8">
      {/* Header & Search */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">
          Explore <span className="text-yellow-500">Manga</span>
        </h1>
        <p className="text-gray-400 mb-4 max-w-2xl mx-auto">
          Read thousands of manga titles from around the world in high definition.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="text-sm text-gray-300 font-semibold uppercase tracking-widest">
            Search provider
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-yellow-500 transition-all"
          >
            {MANGA_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search manga (e.g. Berserk, One Piece)..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500 transition-all placeholder:text-gray-600"
          />
          <button 
            type="submit"
            className="absolute right-3 top-3 px-6 py-1.5 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 transition-all active:scale-95"
          >
            SEARCH
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="text-center py-24 text-red-500 font-bold">
            Failed to load manga results. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results?.results?.map((manga) => (
              <Link 
                key={manga.id}
                to={`/manga/${encodeURIComponent(manga.id)}?provider=${manga.provider || 'MangaPill'}`}
                className="group relative flex flex-col gap-3 transition-transform hover:-translate-y-2"
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-xl relative">
                  <img 
                    src={manga.image} 
                    alt={cleanTitle(manga.title)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                     <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Read Now</span>
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-yellow-500 transition-colors">
                      {cleanTitle(manga.title)}
                    </h3>
                    <span className="text-[10px] px-2 py-1 bg-yellow-500 text-black font-black rounded-full uppercase">
                      {manga.provider || selectedProvider}
                    </span>
                  </div>
                  {manga.releaseDate && (
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{manga.releaseDate}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
