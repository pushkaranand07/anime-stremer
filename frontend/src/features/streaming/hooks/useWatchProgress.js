import { useState, useCallback } from 'react';

const STORAGE_KEY = 'anime_discovery_watch_progress';

export function useWatchProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveProgress = useCallback((animeId, episodeNumber, time, duration) => {
    if (!animeId || !episodeNumber) return;
    
    // Don't save if less than 10 seconds or near the end (95%)
    if (time < 10 || (duration && time / duration > 0.95)) {
      // If near the end, we might want to clear it
      return;
    }

    const newProgress = {
      ...progress,
      [animeId]: {
        episodeNumber,
        time,
        duration,
        updatedAt: Date.now()
      }
    };

    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  }, [progress]);

  const getProgress = useCallback((animeId) => {
    return progress[animeId] || null;
  }, [progress]);

  const clearProgress = useCallback((animeId) => {
    const { [animeId]: removed, ...rest } = progress;
    setProgress(rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [progress]);

  return {
    saveProgress,
    getProgress,
    clearProgress
  };
}
