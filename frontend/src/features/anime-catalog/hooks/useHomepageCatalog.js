import { useQuery } from '@tanstack/react-query';
import { jikan } from '../services/jikanClient';

// ── Single serialized fetch for ALL homepage data ─────────────────────────────
// One React Query cache entry = one query fired at a time.
// Inside, each jikan.get() awaits the previous one, and the shared
// throttledGet queue in jikanClient enforces 400ms between them.
// This completely prevents the "4 hooks mount simultaneously → 4 parallel
// requests → 429 storm" problem.
async function fetchAllHomepageData() {
  const popular    = await jikan.get('/top/anime',   { filter: 'bypopularity', limit: 8 });
  const seasonal   = await jikan.get('/seasons/now', { limit: 5 });
  const newAdded   = await jikan.get('/anime',       { order_by: 'start_date', sort: 'desc', limit: 5 });
  const schedule   = await jikan.get('/schedules');
  const completed  = await jikan.get('/anime',       { status: 'complete', order_by: 'end_date', sort: 'desc', limit: 5 });
  return { popular, seasonal, newAdded, schedule, completed };
}

// ── Primary unified hook ──────────────────────────────────────────────────────
export function useHomepageCatalog() {
  return useQuery({
    queryKey: ['homepage-catalog'],
    queryFn: fetchAllHomepageData,
    staleTime: 5 * 60 * 1000,   // 5 min — navigating back won't re-fire
    gcTime:   30 * 60 * 1000,   // 30 min — keep cache warm
    retry: false,                // throttledGet handles its own single retry
  });
}

// ── Selector hooks — extract slices from the unified cache ────────────────────
// These have IDENTICAL signatures to the old individual hooks, so every
// component (FeaturedSlider, EstimatedSchedule, ColumnsSection) works
// with zero changes.

/**
 * Returns the popular anime array for FeaturedSlider.
 * Maps to the old: return useQuery({ queryFn: () => jikanClient.get('/top/anime') })
 */
export const useFeaturedAnime = () => {
  const q = useHomepageCatalog();
  return { ...q, data: q.data?.popular?.data ?? [] };
};

/**
 * Returns the weekly schedule array for EstimatedSchedule.
 * Maps to the old: return useQuery({ queryFn: () => jikanClient.get('/schedules') })
 */
export const useEstimatedSchedule = () => {
  const q = useHomepageCatalog();
  return { ...q, data: q.data?.schedule?.data ?? [] };
};

/**
 * Returns { newReleases, newAdded, justCompleted } for ColumnsSection.
 * Maps to the old useColumnsSectionData shape exactly.
 */
export const useColumnsSectionData = () => {
  const q = useHomepageCatalog();
  return {
    ...q,
    data: q.data
      ? {
          newReleases:   q.data.seasonal?.data  ?? [],
          newAdded:      q.data.newAdded?.data   ?? [],
          justCompleted: q.data.completed?.data  ?? [],
        }
      : undefined,
  };
};

// ── Dynamic leaderboard — separate query (user-driven tab changes) ────────────
// This CANNOT be folded into the unified query because the filter param
// changes at runtime when the user clicks Day / Week / Month tabs.
// It still uses jikan.get() so the shared throttle queue protects it.
export const useTopAnimeLeaderboard = (filter = 'bypopularity') => {
  return useQuery({
    queryKey: ['anime', 'leaderboard', filter],
    queryFn: async () => {
      const data = await jikan.get('/top/anime', { filter, limit: 8 });
      return data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime:    30 * 60 * 1000,
    retry: false,
  });
};
