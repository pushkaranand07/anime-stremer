import { useState, useEffect, useCallback } from 'react';
import { streamingService } from '../../services/streamingService';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import Player from './Player';

export default function WatchModule({ animeId, episode, animeTitle, poster, onEpisodeChange }) {
  const [subOrDub, setSubOrDub] = useState('sub');
  const [provider, setProvider] = useState('Hianime');
  const [sources, setSources] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { saveProgress, getProgress } = useWatchProgress();
  const savedProgress = getProgress(animeId);
  const [startTime, setStartTime] = useState(0);

  // Load sources when episode or sub/dub changes
  const loadSources = useCallback(async () => {
    if (!episode?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await streamingService.getEpisodeSources(episode.id, provider, subOrDub);
      setSources(data.sources || []);
      setSubtitles(data.subtitles || []);
      setProvider(data.provider);

      // If we have saved progress for THIS episode, set it
      if (savedProgress && savedProgress.episodeNumber === episode.number) {
        setStartTime(savedProgress.time);
      } else {
        setStartTime(0);
      }
    } catch (err) {
      console.error('[WatchModule] Failed to load sources:', err);
      setError(err.response?.data?.details || err.message);
    } finally {
      setLoading(false);
    }
  }, [episode?.id, subOrDub, animeId]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const handleTimeUpdate = (time, duration) => {
    saveProgress(animeId, episode.number, time, duration);
  };

  const handleEnded = () => {
    if (onEpisodeChange) {
      onEpisodeChange(episode.number + 1);
    }
  };

  if (!episode) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Player Wrapper */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-black text-white uppercase tracking-widest">Initialising Stream...</span>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm rounded-xl p-8 text-center border border-red-500/20">
            <span className="text-5xl">📡</span>
            <h3 className="text-xl font-black text-white">Stream Connection Lost</h3>
            <p className="text-gray-400 text-sm max-w-md">{error}</p>
            <button 
              onClick={loadSources}
              className="mt-2 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-yellow-500/20"
            >
              RETRY CONNECTION
            </button>
          </div>
        )}

        <Player 
          sources={sources}
          subtitles={subtitles}
          poster={poster}
          title={`${animeTitle} - Episode ${episode.number}`}
          startTime={startTime}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      </div>

      {/* Quick Controls Under Player */}
      <div className="flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Currently Playing</span>
            <span className="text-sm font-bold text-white">
              Episode {episode.number}: {episode.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub/Dub Selector */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
            <button 
              onClick={() => setSubOrDub('sub')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${subOrDub === 'sub' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              SUB
            </button>
            <button 
              onClick={() => setSubOrDub('dub')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${subOrDub === 'dub' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              DUB
            </button>
          </div>
          
          {/* Provider Badge */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-black text-gray-400 uppercase">{provider}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
