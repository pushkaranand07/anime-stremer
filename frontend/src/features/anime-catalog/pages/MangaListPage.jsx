import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchManga } from '../../../api/endpoints';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function MangaListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useQuery(
    ['mangaList', page],
    () => searchManga('', page),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );

  const mangas = data?.data || [];
  const totalItems = data?.pagination?.items?.total || 0;
  const canLoadMore = mangas.length === 25 && mangas.length < totalItems;

  if (isLoading) {
    return <div className="page-shell"><LoadingSpinner /></div>;
  }

  if (isError) {
    return <div className="page-shell text-center text-red-400 py-20">Failed to load manga list.</div>;
  }

  return (
    <div className="page-shell">
      <section className="manga-list-header">
        <div>
          <h1 className="page-title">Manga Library</h1>
          <p className="page-subtitle">Browse the latest manga from Kitsu with search and pagination support.</p>
        </div>
      </section>

      <div className="manga-grid">
        {mangas.map((manga) => (
          <Link key={manga.id} to={`/manga/${manga.id}`} className="manga-card">
            <img
              src={manga.posterImage?.medium || manga.posterImage?.large || '/placeholder.png'}
              alt={manga.canonicalTitle}
              className="manga-card-image"
            />
            <div className="manga-card-body">
              <h2 className="manga-card-title">{manga.canonicalTitle}</h2>
              <p className="manga-card-meta">{manga.status || 'Unknown status'}</p>
              <p className="manga-card-meta">Rating: {manga.averageRating || 'N/A'}</p>
              <p className="manga-card-description">{manga.synopsis ? `${manga.synopsis.slice(0, 140)}...` : 'No synopsis available.'}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="manga-list-footer">
        <button
          type="button"
          className="load-more-button"
          onClick={() => setPage((current) => current + 1)}
          disabled={!canLoadMore || isFetching}
        >
          {isFetching ? 'Loading...' : canLoadMore ? 'Load More' : 'No More Manga'}
        </button>
      </div>
    </div>
  );
}
