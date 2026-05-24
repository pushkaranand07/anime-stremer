import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAnimeById } from '../../../api/endpoints';
import { streamingService } from '../services/streamingService';
import WatchModule from '../components/WatchModule';
import EpisodeList from '../components/EpisodeList';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

import '../styles/watch-page.css';

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentEpisode, setCurrentEpisode] = useState(null);

  // ── Metadata fetching ──────────────────────────────────────────────────
  const { data: anime, isLoading: animeLoading } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnimeById(id),
  });

  const { 
    data: streamInfo, 
    isLoading: streamLoading,
    isError: streamError,
    error: streamErrorInfo 
  } = useQuery({
    queryKey: ['streaming', id],
    queryFn: () => streamingService.getAnimeInfo(anime.title.trim()),
    enabled: !!anime?.title,
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });

  // Restore episode from URL param, or default to first episode
  useEffect(() => {
    if (!streamInfo?.episodes?.length) return;
    if (currentEpisode) return; // Already set — don't reset

    const epParam = parseInt(searchParams.get('ep'), 10);
    const targetEp = epParam
      ? streamInfo.episodes.find(e => e.number === epParam) ?? streamInfo.episodes[0]
      : streamInfo.episodes[0];
    setCurrentEpisode(targetEp);
  }, [streamInfo, currentEpisode, searchParams]);

  const handleEpisodeSelect = (ep) => {
    setCurrentEpisode(ep);
    setSearchParams({ ep: ep.number });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextEpisode = (nextNumber) => {
    const nextEp = streamInfo?.episodes?.find(e => e.number === nextNumber);
    if (nextEp) {
      handleEpisodeSelect(nextEp);
    }
  };

  if (animeLoading) return <LoadingSpinner />;

  // Even if stream failed, we want to show the anime info, 
  // but we should show a clear error in the player area.

  return (
    <div className="watch-page-container">
      {/* Header Info */}
      <div className="watch-header">
        <button 
          onClick={() => navigate(`/anime/${id}`)}
          className="watch-back-btn"
        >
          <span>←</span> BACK TO DETAILS
        </button>
        <h1 className="watch-title">
          {anime?.title}
        </h1>
      </div>

      <div className="watch-layout">
        {/* Left: Player Section */}
        <div className="watch-main-col">
          {streamLoading ? (
            <div className="watch-loader-wrapper">
              <div className="watch-loader-spinner" />
              <span className="watch-loader-text">Searching Streams...</span>
            </div>
          ) : streamError || !streamInfo?.episodes?.length ? (
            <div className="watch-error-wrapper">
              <span className="watch-error-icon">📡</span>
              <div>
                <h2 className="watch-error-title">No Streams Available</h2>
                <p className="watch-error-text">
                  We couldn't find any active streams for this title on our providers. 
                  {streamErrorInfo?.message && <span className="watch-error-details">{streamErrorInfo.message}</span>}
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="watch-btn-retry"
              >
                RETRY SEARCH
              </button>
            </div>
          ) : (
            <WatchModule 
              animeId={id}
              episode={currentEpisode}
              animeTitle={anime?.title}
              poster={anime?.images?.jpg?.large_image_url}
              onEpisodeChange={handleNextEpisode}
            />
          )}

          {/* Synopsis (Mobile) */}
          <div className="lg:hidden watch-synopsis-card">
            <h2 className="watch-synopsis-title">Synopsis</h2>
            <p className="watch-synopsis-text">{anime?.synopsis}</p>
          </div>
        </div>

        {/* Right: Sidebar (Episode List & Info) */}
        <aside className="watch-sidebar-col">
          <div className="watch-sidebar-card">
            {streamLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(i => <div key={i} className="aspect-square bg-white/10 rounded-xl animate-pulse" />)}
                </div>
              </div>
            ) : (
              <EpisodeList 
                episodes={streamInfo?.episodes}
                currentEpisode={currentEpisode}
                onEpisodeSelect={handleEpisodeSelect}
              />
            )}
            {!streamLoading && !streamInfo?.episodes?.length && (
              <div className="text-center py-4">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Episodes Found</p>
              </div>
            )}
          </div>

          <div className="hidden lg:block watch-sidebar-card">
            <h2 className="watch-synopsis-title">Quick Info</h2>
            <div className="watch-quick-info">
              <div className="watch-info-item">
                <p className="label">Status</p>
                <p className="value">{anime?.status}</p>
              </div>
              <div className="watch-info-item">
                <p className="label">Aired</p>
                <p className="value">{anime?.aired?.string}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
