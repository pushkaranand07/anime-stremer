import { motion } from 'framer-motion';
import GlowButton from '../../components/ui/GlowButton';
import '../../styles/hero-section.css';

export default function HeroSection() {
  return (
    <section id="hero" className="hero-section">
      {/* ── Cinematic overlay — lets video show through beautifully ── */}
      <div className="hero-cinematic-overlay" />

      {/* ── Hero Content ── */}
      <div className="hero-content">
        {/* JP subtitle */}
        <p className="hero-subtitle">
          次元を超えて
        </p>

        {/* Title line 1 */}
        <h1 className="hero-title-1">
          ENTER ANOTHER
        </h1>

        {/* Title line 2 — gradient + shimmer */}
        <h1 className="hero-title-2">
          DIMENSION
        </h1>

        {/* Description */}
        <p className="hero-description">
          Watch anime, read manga and<br/>
          dive into stories beyond imagination.
        </p>

        {/* CTA Buttons */}
        <div className="hero-buttons-container">
          <button className="hero-primary-btn">
            <div className="hero-primary-btn-icon-wrap">▶</div>
            EXPLORE NOW
          </button>

          <GlowButton variant="outline">Browse Library</GlowButton>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="hero-scroll-indicator" />

      {/* ── Stats Bar ── */}
      <div className="hero-stats-bar">
        {[
          { num: '12', unit: 'K+', label: 'Anime Series' },
          { num: '48', unit: 'K+', label: 'Episodes' },
          { num: '2',  unit: 'M+', label: 'Members' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
            {i > 0 && (
              <div className="hero-stats-divider" />
            )}
            <div className="hero-stats-item">
              <div className="hero-stats-num">
                {s.num}<span style={{ color: 'var(--accent-violet)' }}>{s.unit}</span>
              </div>
              <div className="hero-stats-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
