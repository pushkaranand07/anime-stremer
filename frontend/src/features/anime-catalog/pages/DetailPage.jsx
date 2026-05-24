import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAnimeById, fetchAnimeCharacters } from '../../../api/endpoints';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { useScrollTriggerRefresh } from '../../../hooks/useScrollTriggerRefresh';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useFavorites } from '../../favorites/context/FavoritesContext';
import { useAuth } from '../../auth/context/AuthContext';
import MagnetButton from '../../../components/ui/MagnetButton';
import gsap from 'gsap';
import { activateMagneto, resetMagneto, animateSplitText } from '../../../animations/animation';

import { streamingService } from '../../streaming/services/streamingService';
import '../styles/detail-page.css';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const contentRef = useScrollAnimation(animeLoading, { start: 'top 80%', opacity: 1, y: 0 });

  const magnetoRef = useRef(null);
  const magnetoTextRef = useRef(null);

  // ── MAL / Jikan metadata ────────────────────────────────────────────────
  const { data: anime, isLoading: animeLoading, isError: animeError } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnimeById(id),
  });

  useScrollTriggerRefresh([!animeLoading, !!anime]);

  const { data: characters, isLoading: charactersLoading } = useQuery({
    queryKey: ['anime', id, 'characters'],
    queryFn: () => fetchAnimeCharacters(id),
    enabled: !!anime,
  });

  const { 
    data: streamInfo, 
    isLoading: streamLoading, 
    isError: streamError 
  } = useQuery({
    queryKey: ['streaming', id, anime?.title],
    queryFn: () => streamingService.getAnimeInfo(anime.title.trim()),
    enabled: !!anime?.title,
    retry: 1,
  });

  // Stagger title animation when metadata is loaded
  useEffect(() => {
    if (!animeLoading && anime?.title) {
      const ctx = gsap.context(() => {
        animateSplitText('.detail-title-letter', '.detail-title', 0.8, 0.02, 0.1);
      });
      return () => ctx.revert();
    }
  }, [animeLoading, anime?.title]);

  const handleMouseMove = (e) => {
    activateMagneto(e, magnetoRef, magnetoTextRef, 30, 15);
  };

  const handleMouseLeave = () => {
    resetMagneto(magnetoRef, magnetoTextRef);
  };

  const splitTitle = (title) => {
    if (!title) return '';
    return title.split('').map((char, index) => (
      <span
        key={index}
        className="detail-title-letter"
        style={{ display: 'inline-block', opacity: 0, transform: 'translateY(24px)' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  if (animeLoading) return <LoadingSpinner />;
  if (animeError || !anime) return <div className="text-center py-20 text-red-500">Failed to load anime details.</div>;

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (isFavorite(anime.mal_id)) removeFavorite(anime.mal_id);
    else addFavorite(anime);
  };

  return (
    <div className="detail-page-container">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div className="detail-hero-banner">
        <img
          src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
          alt={anime.title}
          className="detail-hero-blur-image"
        />
        <div className="detail-hero-gradient-overlay" />

        <div className="detail-hero-content-wrapper">
          <div className="detail-hero-grid">
            <div 
              ref={magnetoRef}
              className="detail-hero-poster-wrapper"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="detail-hero-poster">
                <img 
                  ref={magnetoTextRef}
                  src={anime.images?.jpg?.large_image_url} 
                  alt={anime.title} 
                />
              </div>
              <div className="detail-vinyl-disk">
                <div className="vinyl-center-art-wrapper">
                  <img 
                    className="vinyl-center-art"
                    src={anime.images?.jpg?.large_image_url} 
                    alt={anime.title} 
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="detail-tag-list">
                <span className="detail-tag-type">{anime.type}</span>
                <span className="detail-tag-status">{anime.status}</span>
                <span className="detail-tag-season">{anime.season} {anime.year}</span>
              </div>
              <h1 className="detail-title">{splitTitle(anime.title)}</h1>
              <div className="detail-stats">
                <div className="detail-stat-score"><span className="text-2xl">⭐</span><span>{anime.score || 'N/A'}</span></div>
                <div className="detail-stat-rank"><span className="text-2xl">📊</span><span>#{anime.rank || 'N/A'}</span></div>
                <div className="detail-stat-members"><span className="text-2xl">👥</span><span>{anime.members?.toLocaleString() || '0'}</span></div>
              </div>
              <div className="detail-buttons">
                <button 
                  onClick={() => navigate(`/watch/${id}`)}
                  className="detail-btn-watch"
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
      <div ref={contentRef} className="detail-content-section">
        <div className="detail-content-layout">

          {/* ── Left Column ──────────────────────────────────────────────── */}
          <div>
            {/* ── Synopsis ─────────────────────────────────────────────── */}
            <div className="detail-synopsis-card">
              <h2 className="detail-synopsis-title">
                <span />
                Synopsis
              </h2>
              <p className="detail-synopsis-text">{anime.synopsis || 'No synopsis available.'}</p>
              {anime.background && (
                <>
                  <h2 className="detail-synopsis-title">
                    <span />
                    Background
                  </h2>
                  <p className="detail-background-text">{anime.background}</p>
                </>
              )}
            </div>

            {/* ── Characters ───────────────────────────────────────────── */}
            <div className="detail-characters-section">
              <h2 className="detail-characters-title">Main Characters</h2>
              {charactersLoading ? (
                <div className="flex gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 flex-1 bg-white/5 animate-pulse rounded-2xl" />)}
                </div>
              ) : (
                <div className="detail-characters-grid">
                  {characters?.slice(0, 8).map((char) => (
                    <div key={char.character.mal_id} className="detail-character-card">
                      <img
                        src={char.character.images.jpg.image_url}
                        alt={char.character.name}
                      />
                      <div className="detail-character-overlay" />
                      <div className="detail-character-info">
                        <p className="name">{char.character.name}</p>
                        <p className="role">{char.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Trailer ──────────────────────────────────────────────── */}
            {anime.trailer?.embed_url && (
              <div className="detail-trailer-section">
                <h2 className="detail-trailer-title">Official Trailer</h2>
                <div className="detail-trailer-wrapper">
                  <iframe src={anime.trailer.embed_url} title={`${anime.title} Trailer`} allowFullScreen />
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Info Sidebar ───────────────────────────────── */}
          <div>
            <div className="detail-sidebar-info">
              <h3 className="detail-sidebar-title">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Information
              </h3>
              <div className="detail-sidebar-items">
                <div className="detail-sidebar-item">
                  <p className="label">Aired</p>
                  <p className="value">{anime.aired?.string || 'Unknown'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Studios</p>
                  <p className="value">{anime.studios?.map(s => s.name).join(', ') || 'Unknown'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Genres</p>
                  <div className="detail-genre-tags">
                    {anime.genres?.map(g => (
                      <span key={g.mal_id} className="detail-genre-tag">{g.name}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Source</p>
                  <p className="value">{anime.source || 'N/A'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Rating</p>
                  <p className="value">{anime.rating || 'N/A'}</p>
                </div>
                <div className="detail-stream-status">
                  <p className="label">Streaming Status</p>
                  {streamLoading ? (
                    <div className="stream-status-loading">
                      <div className="stream-status-dot loading animate-pulse" />
                      <span>Searching providers...</span>
                    </div>
                  ) : streamInfo?.episodes?.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="stream-status-dot online" />
                        <span className="stream-status-provider">{streamInfo?.provider} (Online)</span>
                      </div>
                      {streamInfo?.hasDub && (
                        <p className="stream-status-dub">🇺🇸 English Dub Available</p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 opacity-50">
                      <span className="stream-status-dot offline" />
                      <span className="text-gray-400 text-sm font-bold">No streams found</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
