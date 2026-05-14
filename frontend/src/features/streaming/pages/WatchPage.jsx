import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAnimeById } from '../../../api/endpoints';
import { streamingService } from '../services/streamingService';
import WatchModule from '../components/Player/WatchModule';
import EpisodeList from '../components/EpisodeList/EpisodeList';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

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
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header Info */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <button 
          onClick={() => navigate(`/anime/${id}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-sm font-bold group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK TO DETAILS
        </button>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
          {anime?.title}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left: Player Section */}
        <div className="flex flex-col gap-8">
          {streamLoading ? (
            <div className="aspect-video bg-white/5 rounded-3xl flex items-center justify-center animate-pulse border border-white/10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Searching Streams...</span>
              </div>
            </div>
          ) : streamError || !streamInfo?.episodes?.length ? (
            <div className="aspect-video bg-white/5 rounded-3xl flex flex-col items-center justify-center gap-6 p-12 text-center border border-dashed border-white/10">
              <span className="text-6xl opacity-20">📡</span>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">No Streams Available</h2>
                <p className="text-gray-500 text-sm max-w-sm">
                  We couldn't find any active streams for this title on our providers. 
                  {streamErrorInfo?.message && <span className="block mt-2 text-red-500/50 font-mono text-[10px]">{streamErrorInfo.message}</span>}
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10"
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
          <div className="lg:hidden bg-white/5 rounded-3xl p-6 border border-white/10">
            <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Synopsis</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{anime?.synopsis}</p>
          </div>
        </div>

        {/* Right: Sidebar (Episode List & Info) */}
        <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl min-h-[100px] flex flex-col justify-center">
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

          <div className="hidden lg:block bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Quick Info</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</p>
                <p className="text-sm font-bold text-white">{anime?.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aired</p>
                <p className="text-sm font-bold text-white">{anime?.aired?.string}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
