import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFeaturedAnime } from '../hooks/useHomepageCatalog';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import '../styles/featured-slider.css';

const getAccentColor = (id) => {
  const colors = ['#10b981', '#eab308', '#ec4899', '#a855f7', '#00f0ff', '#f97316', '#3b82f6'];
  return colors[id % colors.length];
};

export default function FeaturedSlider() {
  const navigate = useNavigate();
  const { data: rawSlides, isLoading, isError } = useFeaturedAnime();
  const [current, setCurrent] = useState(0);

  // Auto-play loop
  useEffect(() => {
    if (!rawSlides || rawSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % rawSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [rawSlides]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 w-full h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !rawSlides || rawSlides.length === 0) {
    return null;
  }

  const slides = rawSlides.map((anime) => {
    // Prefer wide landscape thumbnail from trailer; fall back to poster
    const landscapeBg =
      anime.trailer?.images?.maximum_image_url ||
      anime.trailer?.images?.large_image_url    ||
      anime.trailer?.images?.medium_image_url   ||
      null;

    const posterImg =
      anime.images?.jpg?.large_image_url ||
      anime.images?.jpg?.image_url        ||
      null;

    const cleanRating = anime.rating ? anime.rating.split(' ')[0] : 'PG-13';

    return {
      id:          anime.mal_id,
      title:       anime.title_english || anime.title,
      synopsis:    anime.synopsis || 'Dive into an unforgettable epic journey filled with magic, adventure, and breathtaking encounters beyond imagination.',
      tags:        [cleanRating, 'HD', anime.type || 'TV', 'Sub & Dub'],
      landscapeBg,
      posterImg,
      accentColor: getAccentColor(anime.mal_id),
    };
  });

  const slide        = slides[current];
  const hasLandscape = !!slide.landscapeBg;

  // Always fill the background — use landscape if available, else the poster itself
  const bgImageUrl   = hasLandscape ? slide.landscapeBg : slide.posterImg;

  return (
    <section className="featured-slider-section">
      <div className="featured-slider-container">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="featured-slide-wrapper"
          >
            {/* ── Background — always vibrant, blurred when poster-only ── */}
            <div
              className={`featured-slide-bg${hasLandscape ? ' has-landscape' : ''}`}
              style={{ backgroundImage: `url(${bgImageUrl})` }}
            />

            {/* ── Cinematic masks ── */}
            <div className="featured-slide-left-mask" />
            <div className="featured-slide-bottom-mask" />

            {/* ── Accent atmosphere glow ── */}
            <div
              className="featured-slide-accent-glow"
              style={{ background: slide.accentColor }}
            />

            {/* ── Main content row ── */}
            <div className="featured-slide-content">

              {/* Left: text details */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, duration: 0.4, ease: 'easeOut' }}
                className="featured-slide-details"
              >
                {/* Title */}
                <h2 className="featured-slide-title">{slide.title}</h2>

                {/* Badge tags */}
                <div className="featured-slide-tags">
                  {slide.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`featured-slide-tag${tag === 'HD' ? ' hd' : tag === 'CC' ? ' cc' : ''}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Synopsis */}
                <p className="featured-slide-synopsis">{slide.synopsis}</p>

                {/* Play button */}
                <button
                  onClick={() => navigate(`/anime/${slide.id}`)}
                  className="featured-slide-play-btn"
                  style={{
                    '--accent-hover': slide.accentColor,
                    boxShadow: `0 0 18px ${slide.accentColor}44`,
                  }}
                >
                  <span className="play-btn-icon">▶</span>
                  PLAY NOW
                </button>
              </motion.div>

              {/* Right: poster card — always shown (hidden on mobile via CSS) */}
              {slide.posterImg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 12 }}
                  animate={{ opacity: 1, scale: 1,    y: 0 }}
                  transition={{ delay: 0.18, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                  className="featured-slide-poster-float"
                >
                  <img
                    src={slide.posterImg}
                    alt={slide.title}
                    className="slide-poster-img"
                  />
                  <div
                    className="slide-poster-glow"
                    style={{ boxShadow: `0 0 50px ${slide.accentColor}66, 0 0 100px ${slide.accentColor}33` }}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Carousel dots ── */}
        <div className="featured-slider-dots">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrent(index)}
              className={`featured-slider-dot ${index === current ? 'active' : ''}`}
              style={{
                backgroundColor: index === current ? s.accentColor : 'rgba(255,255,255,0.18)',
                boxShadow:        index === current ? `0 0 12px ${s.accentColor}` : 'none',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
