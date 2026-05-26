import { useQuery } from '@tanstack/react-query';
import { jikan } from '../services/jikanClient';

async function fetchAllHomepageData() {
  const popular = await jikan.get('/top/anime', { filter: 'bypopularity', limit: 8 });
  const seasonal = await jikan.get('/seasons/now', { limit: 5 });
  const newAdded = await jikan.get('/anime', { order_by: 'start_date', sort: 'desc', limit: 5 });
  const schedule = await jikan.get('/schedules');
  const completed = await jikan.get('/anime', { status: 'complete', order_by: 'end_date', sort: 'desc', limit: 5 });

  return { popular, seasonal, newAdded, schedule, completed };
}

export function useHomepageCatalog() {
  return useQuery({
    queryKey: ['homepage-catalog'],
    queryFn: fetchAllHomepageData,
    staleTime: 5 * 60 * 1000,   // 5 min — navigating back won't re-fire
    gcTime:   30 * 60 * 1000,   // 30 min — keep cache warm
    retry: false,
  });
}

export const useFeaturedAnime = () => {
  const q = useHomepageCatalog();
  return { ...q, data: q.data?.popular?.data ?? [] };
};

export const useEstimatedSchedule = () => {
  const q = useHomepageCatalog();
  return { ...q, data: q.data?.schedule?.data ?? [] };
};

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
