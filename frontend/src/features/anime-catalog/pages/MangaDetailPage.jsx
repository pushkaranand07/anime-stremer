import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMangaById, fetchMangaChapters, fetchMangaCharacters } from '../../../api/endpoints';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { useScrollTriggerRefresh } from '../../../hooks/useScrollTriggerRefresh';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useFavorites } from '../../favorites/context/FavoritesContext';
import { useAuth } from '../../../auth/authHooks';
import MagnetButton from '../../../components/ui/MagnetButton';
import gsap from 'gsap';
import { activateMagneto, resetMagneto, animateSplitText } from '../../../animations/animation';

import '../styles/detail-page.css';

export default function MangaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const magnetoRef = useRef(null);
  const magnetoTextRef = useRef(null);

  // ── Kitsu Manga metadata ────────────────────────────────────────────────
  const { data: manga, isLoading: mangaLoading, isError: mangaError } = useQuery({
    queryKey: ['manga', id],
    queryFn: () => fetchMangaById(id),
  });

  const contentRef = useScrollAnimation(mangaLoading, { start: 'top 80%', opacity: 1, y: 0 });

  useScrollTriggerRefresh([!mangaLoading, !!manga]);

  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ['manga', id, 'chapters'],
    queryFn: () => fetchMangaChapters(id),
    enabled: !!manga,
  });

  const { data: characters, isLoading: charactersLoading } = useQuery({
    queryKey: ['manga', id, 'characters'],
    queryFn: () => fetchMangaCharacters(id),
    enabled: !!manga,
  });

  // Stagger title animation when metadata is loaded
  useEffect(() => {
    if (!mangaLoading && manga?.attributes?.canonicalTitle) {
      const ctx = gsap.context(() => {
        animateSplitText('.detail-title-letter', '.detail-title', 0.8, 0.02, 0.1);
      });
      return () => ctx.revert();
    }
  }, [mangaLoading, manga?.attributes?.canonicalTitle]);

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

  if (mangaLoading) return <LoadingSpinner />;
  if (mangaError || !manga) return <div className="text-center py-20 text-red-500">Failed to load manga details.</div>;

  const attrs = manga.attributes || {};
  const posterUrl = attrs.posterImage?.large || attrs.posterImage?.medium || attrs.posterImage?.original;
  const coverUrl = attrs.coverImage?.large || attrs.coverImage?.original || posterUrl;

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    if (isFavorite(manga.id)) removeFavorite(manga.id);
    else addFavorite(manga);
  };

  return (
    <div className="detail-page-container">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div className="detail-hero-banner">
        <img
          src={coverUrl}
          alt={attrs.canonicalTitle}
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
                  src={posterUrl} 
                  alt={attrs.canonicalTitle} 
                />
              </div>
              <div className="detail-vinyl-disk">
                <div className="vinyl-center-art-wrapper">
                  <img 
                    className="vinyl-center-art"
                    src={posterUrl} 
                    alt={attrs.canonicalTitle} 
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="detail-tag-list">
                <span className="detail-tag-type">{attrs.subtype || 'Manga'}</span>
                <span className="detail-tag-status">{attrs.status}</span>
                {attrs.startDate && (
                  <span className="detail-tag-season">{attrs.startDate.split('-')[0]}</span>
                )}
              </div>
              <h1 className="detail-title">{splitTitle(attrs.canonicalTitle)}</h1>
              <div className="detail-stats">
                <div className="detail-stat-score"><span className="text-2xl">⭐</span><span>{attrs.averageRating ? `${attrs.averageRating}%` : 'N/A'}</span></div>
                <div className="detail-stat-rank"><span className="text-2xl">📊</span><span>#{attrs.popularityRank || 'N/A'} Popular</span></div>
                <div className="detail-stat-members"><span className="text-2xl">👥</span><span>{attrs.userCount?.toLocaleString() || '0'}</span></div>
              </div>
              <div className="detail-buttons" style={{ marginTop: '24px' }}>
                <MagnetButton onClick={handleFavoriteToggle} className={isFavorite(manga.id) ? 'bg-red-500 hover:bg-red-400' : ''}>
                  {isFavorite(manga.id) ? '♥ Favorites' : '♡ Favorites'}
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
              <p className="detail-synopsis-text">{attrs.synopsis || attrs.description || 'No synopsis available.'}</p>
            </div>

            {/* ── Chapters list ────────────────────────────────────────── */}
            <div className="detail-synopsis-card" style={{ marginTop: '32px' }}>
              <h2 className="detail-synopsis-title">
                <span />
                Chapters ({chapters?.length || attrs.chapterCount || 'Unknown'})
              </h2>
              {chaptersLoading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-white/5 animate-pulse rounded-xl" />
                  <div className="h-10 bg-white/5 animate-pulse rounded-xl" />
                </div>
              ) : chapters && chapters.length > 0 ? (
                <div 
                  className="manga-chapters-list" 
                  style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    paddingRight: '8px'
                  }}
                >
                  {chapters.map((chapter) => {
                    const cAttrs = chapter.attributes || {};
                    return (
                      <div 
                        key={chapter.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 18px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                            Chapter {cAttrs.number}: {cAttrs.canonicalTitle || `Chapter ${cAttrs.number}`}
                          </span>
                          {cAttrs.synopsis && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {cAttrs.synopsis.slice(0, 100)}...
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          {cAttrs.published && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {cAttrs.published}
                            </span>
                          )}
                          {cAttrs.length && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {cAttrs.length} Pages
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="detail-synopsis-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>No chapter list found in database.</p>
              )}
            </div>

            {/* ── Characters ───────────────────────────────────────────── */}
            <div className="detail-characters-section">
              <h2 className="detail-characters-title">Manga Characters</h2>
              {charactersLoading ? (
                <div className="flex gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 flex-1 bg-white/5 animate-pulse rounded-2xl" />)}
                </div>
              ) : characters && characters.length > 0 ? (
                <div className="detail-characters-grid">
                  {characters.slice(0, 8).map((char, index) => (
                    <div key={`${char.character.id}-${index}`} className="detail-character-card">
                      <img
                        src={char.character.image}
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
              ) : (
                <p className="detail-synopsis-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>No characters listing available.</p>
              )}
            </div>
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
                  <p className="label">Type</p>
                  <p className="value" style={{ textTransform: 'uppercase' }}>{attrs.subtype || 'Manga'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Status</p>
                  <p className="value" style={{ textTransform: 'capitalize' }}>{attrs.status || 'Unknown'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Chapters</p>
                  <p className="value">{attrs.chapterCount || 'N/A'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Volumes</p>
                  <p className="value">{attrs.volumeCount || '0'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Serialization</p>
                  <p className="value">{attrs.serialization || 'N/A'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Start Date</p>
                  <p className="value">{attrs.startDate || 'Unknown'}</p>
                </div>
                {attrs.endDate && (
                  <div className="detail-sidebar-item">
                    <p className="label">End Date</p>
                    <p className="value">{attrs.endDate}</p>
                  </div>
                )}
                <div className="detail-sidebar-item">
                  <p className="label">Popularity Rank</p>
                  <p className="value">#{attrs.popularityRank || 'N/A'}</p>
                </div>
                <div className="detail-sidebar-item">
                  <p className="label">Rating Rank</p>
                  <p className="value">#{attrs.ratingRank || 'N/A'}</p>
                </div>
                {attrs.ageRatingGuide && (
                  <div className="detail-sidebar-item">
                    <p className="label">Age Rating</p>
                    <p className="value">{attrs.ageRating} ({attrs.ageRatingGuide})</p>
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
