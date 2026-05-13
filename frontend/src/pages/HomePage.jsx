import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useInView } from 'react-intersection-observer';
import { useInfiniteAnime } from '../hooks/useInfiniteAnime';
import AnimeCard from '../components/anime/AnimeCard';
import MagnetButton from '../components/ui/MagnetButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AnimatedCounter from '../components/ui/AnimatedCounter';

export default function HomePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteAnime('airing');
  const heroRef = useRef(null);
  const { ref: bottomRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Hero reveal animation
  useEffect(() => {
    if (status === 'pending') return;
    
    const ctx = gsap.context(() => {
      if (document.querySelector('.hero-content')) {
        gsap.fromTo('.hero-content > *', 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.2 }
        );
      }
      
      if (document.querySelector('.hero-bg')) {
        gsap.fromTo('.hero-bg',
          { scale: 1.2, opacity: 0 },
          { scale: 1, opacity: 0.3, duration: 2, ease: 'power2.out' }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, [status]);

  // Trigger next page when user scrolls to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  if (status === 'pending') return <LoadingSpinner />;
  if (status === 'error') return <div className="text-center py-20 text-red-500">Failed to load anime. Please check your connection.</div>;

  const allAnime = data?.pages.flatMap(page => page.data) || [];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center text-center px-4">
        <div className="hero-bg absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#0a0a0a]" />
        
        <div className="hero-content relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent tracking-tighter">
            THE ANIME <br /> ARCHIVE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 font-medium leading-relaxed max-w-2xl mx-auto">
            Your premium gateway to the world of Japanese animation. Discover, track, and explore thousands of titles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagnetButton onClick={() => document.getElementById('anime-grid').scrollIntoView({ behavior: 'smooth' })}>
              Start Exploring
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </MagnetButton>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCounter targetValue={25000} label="Anime Titles" suffix="+" />
          <AnimatedCounter targetValue={150000} label="Episodes" suffix="+" />
          <AnimatedCounter targetValue={8000} label="Characters" suffix="+" />
          <AnimatedCounter targetValue={100} label="Genres" />
        </div>
      </section>

      {/* Anime Grid */}
      <section id="anime-grid" className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Currently Airing</h2>
            <p className="text-gray-400">Handpicked top-rated shows airing right now</p>
          </div>
          <div className="hidden md:block h-px flex-1 mx-12 bg-gradient-to-r from-yellow-500/50 to-transparent" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {allAnime.map((anime, index) => (
            <AnimeCard key={`${anime.mal_id}-${index}`} anime={anime} index={index} />
          ))}
        </div>

        {/* Sentinel for Infinite Scroll */}
        <div ref={bottomRef} className="mt-12 flex justify-center">
          {isFetchingNextPage && <LoadingSpinner />}
          {!hasNextPage && allAnime.length > 0 && (
            <p className="text-gray-500 font-medium">You've reached the end of the list</p>
          )}
        </div>
      </section>
    </div>
  );
}
