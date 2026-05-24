import { useState, useEffect, useCallback } from 'react';
import { streamingService } from '../services/streamingService';
import { useWatchProgress } from '../hooks/useWatchProgress';
import Player from './Player';

export default function WatchModule({ animeId, episode, animeTitle, poster, onEpisodeChange }) {
  const [subOrDub, setSubOrDub] = useState('sub');
  // preferredProvider: what we REQUEST (stable — doesn't trigger refetch loops)
  const [preferredProvider] = useState('Hianime');
  // activeProvider: what the server actually used (display only)
  const [activeProvider, setActiveProvider] = useState('Hianime');
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
      // Use episode.provider (the issuer) if available, otherwise the preferred default
      const providerToUse = episode.provider || preferredProvider;
      const data = await streamingService.getEpisodeSources(episode.id, providerToUse, subOrDub);
      setSources(data.sources || []);
      setSubtitles(data.subtitles || []);
      setActiveProvider(data.provider || providerToUse); // Display only — not a fetch dependency

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
  }, [episode?.id, episode?.provider, subOrDub, preferredProvider]);
  // ↑ preferredProvider is stable (not set by this callback), so no loop
  // ↑ activeProvider is NOT in deps — it's set by this callback, which would cause a loop

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
    <div className="watch-module-container">
      {/* Player Wrapper */}
      <div className="watch-player-wrapper">
        {loading && (
          <div className="watch-player-loader">
            <div className="watch-player-loader-spinner" />
            <span className="watch-player-loader-text">Initialising Stream...</span>
          </div>
        )}

        {error && !loading && (
          <div className="watch-player-error">
            <span className="watch-player-error-icon">📡</span>
            <h3 className="watch-player-error-title">Stream Connection Lost</h3>
            <p className="watch-player-error-text">{error}</p>
            <button 
              onClick={loadSources}
              className="watch-player-btn-retry"
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
      <div className="watch-controls-row">
        <div className="watch-playing-info">
          <span className="label">Currently Playing</span>
          <span className="value">
            Episode {episode.number}: {episode.title}
          </span>
        </div>

        <div className="watch-btn-group">
          {/* Sub/Dub Selector */}
          <div className="watch-subdub-selector">
            <button 
              onClick={() => setSubOrDub('sub')}
              className={`watch-subdub-btn ${subOrDub === 'sub' ? 'active' : ''}`}
            >
              SUB
            </button>
            <button 
              onClick={() => setSubOrDub('dub')}
              className={`watch-subdub-btn ${subOrDub === 'dub' ? 'active' : ''}`}
            >
              DUB
            </button>
          </div>
          
          {/* Provider Badge */}
          <div className="watch-provider-badge">
            <div className="watch-provider-dot" />
            <span className="watch-provider-name">{activeProvider}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
