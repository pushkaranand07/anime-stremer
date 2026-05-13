import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAnimeById } from '../../../api/endpoints';
import { streamingService } from '../services/streamingService';
import WatchModule from '../components/Player/WatchModule';
import EpisodeList from '../components/EpisodeList/EpisodeList';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentEpisode, setCurrentEpisode] = useState(null);

  // ── Metadata fetching ──────────────────────────────────────────────────
  const { data: anime, isLoading: animeLoading } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => fetchAnimeById(id),
  });

  const { data: streamInfo, isLoading: streamLoading } = useQuery({
    queryKey: ['streaming', anime?.title],
    queryFn: () => streamingService.getAnimeInfo(anime?.title),
    enabled: !!anime?.title,
  });

  // Set first episode by default if not set
  useEffect(() => {
    if (streamInfo?.episodes?.length > 0 && !currentEpisode) {
      setCurrentEpisode(streamInfo.episodes[0]);
    }
  }, [streamInfo, currentEpisode]);

  const handleEpisodeSelect = (ep) => {
    setCurrentEpisode(ep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextEpisode = (nextNumber) => {
    const nextEp = streamInfo?.episodes?.find(e => e.number === nextNumber);
    if (nextEp) {
      handleEpisodeSelect(nextEp);
    }
  };

  if (animeLoading || streamLoading) return <LoadingSpinner />;

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
          <WatchModule 
            animeId={id}
            episode={currentEpisode}
            animeTitle={anime?.title}
            poster={anime?.images?.jpg?.large_image_url}
            onEpisodeChange={handleNextEpisode}
          />

          {/* Synopsis (Mobile) */}
          <div className="lg:hidden bg-white/5 rounded-3xl p-6 border border-white/10">
            <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Synopsis</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{anime?.synopsis}</p>
          </div>
        </div>

        {/* Right: Sidebar (Episode List & Info) */}
        <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
            <EpisodeList 
              episodes={streamInfo?.episodes}
              currentEpisode={currentEpisode}
              onEpisodeSelect={handleEpisodeSelect}
            />
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
