import { useState } from 'react';
import { useInfiniteAnime } from '../hooks/useInfiniteAnime';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ScrollReveal from '../../../components/ui/ScrollReveal';
import HeroSection from '../components/HeroSection';
import FeaturedSlider from '../components/FeaturedSlider';
import MainContentGrid from '../components/MainContentGrid';
import ColumnsSection from '../components/ColumnsSection';
import EstimatedSchedule from '../components/EstimatedSchedule';
import '../styles/home-page.css';

export default function HomePage() {
  const [visibleCount, setVisibleCount] = useState(12);
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteAnime('airing');

  const allAnime = data?.pages.flatMap(page => page.data) || [];

  const mappedAnime = allAnime.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    episode: anime.episodes ? `Ep ${anime.episodes} • Sub` : 'Airing',
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '/api/placeholder/160/220',
  }));

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

        {/* ── Hero Section — slides up on mount ── */}
        <ScrollReveal direction="up" distance={60} duration={0.9} delay={0.1}>
          <HeroSection />
        </ScrollReveal>

        {/* ── Content below hero (frosted dark panels) ── */}
        <div className="home-sections-flow">
          {status === 'pending' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LoadingSpinner />
              <p className="text-gray-400 mt-4 text-sm font-medium tracking-wide">Initializing neural streams...</p>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-20 text-red-500 font-medium bg-black/40 backdrop-blur-md rounded-2xl mx-8 border border-red-500/20">
              <p>Failed to load anime. {error?.message || 'Please check your connection and try again.'}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* ── 1. Featured Slideshow Slider — fades up ── */}
              <ScrollReveal direction="up" distance={56} duration={0.7} threshold={0.08}>
                <FeaturedSlider />
              </ScrollReveal>

              {/* ── 2. Latest Episodes & Top Anime — slides in from left ── */}
              <ScrollReveal direction="left" distance={64} duration={0.7} delay={0.05} threshold={0.06}>
                <MainContentGrid liveAiringAnime={mappedAnime} visibleCount={visibleCount} />
              </ScrollReveal>

              <div className="flex justify-center mt-8 mb-12">
                <button
                  type="button"
                  onClick={async () => {
                    if (!hasNextPage) return;
                    await fetchNextPage();
                    setVisibleCount((current) => current + 12);
                  }}
                  disabled={!hasNextPage || isFetchingNextPage}
                  className="load-more-button"
                >
                  {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load more titles' : 'No more titles available'}
                </button>
              </div>

              {/* ── 3. Estimated Weekly Schedule — slides in from right ── */}
              <ScrollReveal direction="right" distance={64} duration={0.7} delay={0.05} threshold={0.06}>
                <EstimatedSchedule />
              </ScrollReveal>

              {/* ── 4. Multi-List Columns — fades up last ── */}
              <ScrollReveal direction="up" distance={48} duration={0.65} delay={0.08} threshold={0.05}>
                <ColumnsSection />
              </ScrollReveal>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
