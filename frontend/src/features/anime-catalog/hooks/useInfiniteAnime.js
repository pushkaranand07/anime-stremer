import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchTopAnime } from '../../../api/endpoints';

export const useInfiniteAnime = (filter = 'airing') => {
  return useInfiniteQuery({
    queryKey: ['anime', 'top', filter],
    queryFn: ({ pageParam = 1 }) => fetchTopAnime(pageParam, filter),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Jikan API returns pagination info in the response
      if (lastPage.pagination.has_next_page) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });
};
