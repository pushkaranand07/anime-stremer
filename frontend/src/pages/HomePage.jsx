import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteAnime } from '../hooks/useInfiniteAnime';
import AnimeCard from '../components/anime/AnimeCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HeroSection from '../features/home/HeroSection';
import TrendingSection from '../features/home/TrendingSection';
import '../styles/home-page.css';

export default function HomePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteAnime('airing');
  const { ref: bottomRef, inView } = useInView({ threshold: 0, rootMargin: '100px' });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage]);

  const allAnime = data?.pages.flatMap(page => page.data) || [];

  const mappedAnime = allAnime.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    episode: anime.episodes ? `Ep ${anime.episodes} • Sub` : 'Airing',
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '/api/placeholder/160/220',
  }));

  const trendingAnime = mappedAnime.slice(0, 10);

  return (
    <div className="home-container">

      {/* ── Full-page Your Name background video ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="home-bg-video"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* ── Dark cinematic tint across entire page ── */}
      <div className="home-cinematic-tint" />

      {/* ── Page Content ── */}
      <div className="home-content-wrapper">
        {/* ── Hero Section ── */}
        <HeroSection />

        {/* ── Content below hero (frosted dark panels) ── */}
        <div>
          {status === 'pending' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LoadingSpinner />
              <p className="text-gray-400 mt-4 text-sm font-medium tracking-wide">Initializing neural streams...</p>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-20 text-red-500 font-medium bg-black/40 backdrop-blur-md rounded-2xl mx-8 border border-red-500/20">
              Failed to load anime. Please check your connection and try again.
            </div>
          ) : (
            <>
              {/* Trending */}
              {trendingAnime.length > 0 && (
                <div className="home-trending-wrap">
                  <TrendingSection animeList={trendingAnime} />
                </div>
              )}

              {/* Anime grid */}
              <section
                id="anime-grid"
                className="home-grid-section py-16 max-w-7xl mx-auto px-8"
              >
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
                      <span className="text-[#a855f7]">✦</span> CURRENTLY AIRING
                    </h2>
                    <p className="text-gray-400 text-sm">Handpicked top-rated shows airing right now</p>
                  </div>
                  <div className="hidden md:block h-px flex-1 mx-12 bg-gradient-to-r from-purple-500/30 to-transparent" />
                </div>

                <div className="flex flex-wrap gap-6 justify-center">
                  {mappedAnime.map((anime, index) => (
                    <AnimeCard key={`${anime.id}-${index}`} anime={anime} />
                  ))}
                </div>

                <div ref={bottomRef} className="mt-12 flex justify-center">
                  {isFetchingNextPage && <LoadingSpinner />}
                  {!hasNextPage && allAnime.length > 0 && (
                    <p className="text-gray-500 font-medium">You've reached the end of the list</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
