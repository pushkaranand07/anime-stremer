import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAnimeById, fetchAnimeCharacters } from '../api/endpoints';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import MagnetButton from '../components/ui/MagnetButton';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const contentRef = useScrollAnimation({ start: 'top 80%', opacity: 1, y: 0 });

  // ── MAL / Jikan metadata ────────────────────────────────────────────────
  const { data: anime, isLoading: animeLoading, isError: animeError } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnimeById(id),
  });

  const { data: characters, isLoading: charactersLoading } = useQuery({
    queryKey: ['anime', id, 'characters'],
    queryFn: () => fetchAnimeCharacters(id),
    enabled: !!anime,
  });

  if (animeLoading) return <LoadingSpinner />;
  if (animeError || !anime) return <div className="text-center py-20 text-red-500">Failed to load anime details.</div>;

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (isFavorite(anime.mal_id)) removeFavorite(anime.mal_id);
    else addFavorite(anime);
  };

  return (
    <div className="pb-24">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div className="relative h-[65vh] md:h-[75vh] overflow-hidden">
        <img
          src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
          alt={anime.title}
          className="w-full h-full object-cover scale-105 blur-sm opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full grid md:grid-cols-[300px_1fr] gap-12 items-center">
            <div className="hidden md:block rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[3/4]">
              <img src={anime.images?.jpg?.large_image_url} alt={anime.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-black rounded-full uppercase tracking-widest">{anime.type}</span>
                <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10">{anime.status}</span>
                <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10">{anime.season} {anime.year}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black mb-6 text-white tracking-tighter leading-none">{anime.title}</h1>
              <div className="flex items-center gap-8 text-lg font-bold mb-8">
                <div className="flex items-center gap-2 text-yellow-400"><span className="text-2xl">⭐</span><span>{anime.score || 'N/A'}</span></div>
                <div className="flex items-center gap-2 text-blue-400"><span className="text-2xl">📊</span><span>#{anime.rank || 'N/A'}</span></div>
                <div className="flex items-center gap-2 text-purple-400"><span className="text-2xl">👥</span><span>{anime.members?.toLocaleString() || '0'}</span></div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate(`/watch/${id}`)}
                  className="px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-yellow-500/20 transform hover:-translate-y-1"
                >
                  WATCH ONLINE NOW
                </button>
                <MagnetButton onClick={handleFavoriteToggle} className={isFavorite(anime.mal_id) ? 'bg-red-500 hover:bg-red-400' : ''}>
                  {isFavorite(anime.mal_id) ? '♥ Favorites' : '♡ Favorites'}
                </MagnetButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 opacity-0 translate-y-[50px]">
        <div className="grid lg:grid-cols-[1fr_350px] gap-12">

          {/* ── Left Column ──────────────────────────────────────────────── */}
          <div>
            {/* ── Synopsis ─────────────────────────────────────────────── */}
            <div className="bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-12">
              <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-3">
                <span className="w-8 h-1 bg-yellow-500 rounded-full" />
                Synopsis
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-8">{anime.synopsis || 'No synopsis available.'}</p>
              {anime.background && (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-3">
                    <span className="w-8 h-1 bg-yellow-500 rounded-full" />
                    Background
                  </h2>
                  <p className="text-gray-400 leading-relaxed italic">{anime.background}</p>
                </>
              )}
            </div>

            {/* ── Characters ───────────────────────────────────────────── */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-white">Main Characters</h2>
              {charactersLoading ? (
                <div className="flex gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 flex-1 bg-white/5 animate-pulse rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {characters?.slice(0, 8).map((char) => (
                    <div key={char.character.mal_id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5">
                      <img
                        src={char.character.images.jpg.image_url}
                        alt={char.character.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute bottom-0 p-3 w-full">
                        <p className="font-bold text-sm text-white line-clamp-1">{char.character.name}</p>
                        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">{char.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Trailer ──────────────────────────────────────────────── */}
            {anime.trailer?.embed_url && (
              <div>
                <h2 className="text-3xl font-bold mb-8 text-white">Official Trailer</h2>
                <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <iframe src={anime.trailer.embed_url} title={`${anime.title} Trailer`} className="w-full h-full" allowFullScreen />
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Info Sidebar ───────────────────────────────── */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Information
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Aired</p>
                  <p className="text-gray-200">{anime.aired?.string || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Studios</p>
                  <p className="text-gray-200">{anime.studios?.map(s => s.name).join(', ') || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Genres</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {anime.genres?.map(g => (
                      <span key={g.mal_id} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">{g.name}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Source</p>
                  <p className="text-gray-200">{anime.source || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Rating</p>
                  <p className="text-gray-200 text-sm">{anime.rating || 'N/A'}</p>
                </div>
                {streamInfo && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Stream Provider</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-bold text-sm">{streamInfo.provider}</span>
                    </div>
                    {streamInfo.hasDub && (
                      <p className="text-xs text-blue-400 font-bold mt-1">🇺🇸 English Dub Available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
