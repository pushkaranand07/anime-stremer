import { useState, useCallback, useRef } from 'react';

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

  // Keep a ref to always have the latest progress without stale closures
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const debounceRef = useRef(null);

  const saveProgress = useCallback((animeId, episodeNumber, time, duration) => {
    if (!animeId || !episodeNumber) return;

    // Don't save if less than 10 seconds in
    if (time < 10) return;

    // Clear the progress entry if near the end (95%) — episode is "done"
    if (duration && time / duration > 0.95) {
      const { [animeId]: _removed, ...rest } = progressRef.current;
      progressRef.current = rest;
      setProgress(rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      return;
    }

    // Debounce the localStorage write to once per second
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Use progressRef.current to avoid stale closure — always has latest state
      const newProgress = {
        ...progressRef.current,
        [animeId]: {
          episodeNumber,
          time,
          duration,
          updatedAt: Date.now(),
        },
      };

      progressRef.current = newProgress;
      setProgress(newProgress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    }, 1000);
  }, []); // No dependencies — uses progressRef to avoid stale closures

  const getProgress = useCallback((animeId) => {
    return progressRef.current[animeId] || null;
  }, []); // No dependencies — reads from ref

  const clearProgress = useCallback((animeId) => {
    const { [animeId]: _removed, ...rest } = progressRef.current;
    progressRef.current = rest;
    setProgress(rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, []); // No dependencies — uses progressRef

  return {
    saveProgress,
    getProgress,
    clearProgress,
  };
}
