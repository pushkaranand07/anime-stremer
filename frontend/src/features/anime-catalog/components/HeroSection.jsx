import { motion } from 'framer-motion';
import GlowButton from '../../../components/ui/GlowButton';
import '../styles/hero-section.css';

// Stagger container — children animate in sequence
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

// Each child fades up from 30px below
const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Stats bar counts in from the bottom with a slight spring
const statsVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function HeroSection() {
  return (
    <section id="hero" className="hero-section">
      {/* ── Cinematic overlay — lets video show through beautifully ── */}
      <div className="hero-cinematic-overlay" />

      {/* ── Hero Content ── */}
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* JP subtitle */}
        <motion.p className="hero-subtitle" variants={itemVariants}>
          次元を超えて
        </motion.p>

        {/* Title line 1 */}
        <motion.h1 className="hero-title-1" variants={itemVariants}>
          ENTER ANOTHER
        </motion.h1>

        {/* Title line 2 — gradient + shimmer */}
        <motion.h1 className="hero-title-2" variants={itemVariants}>
          DIMENSION
        </motion.h1>

        {/* Description */}
        <motion.p className="hero-description" variants={itemVariants}>
          Watch anime, read manga and<br/>
          dive into stories beyond imagination.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div className="hero-buttons-container" variants={itemVariants}>
          <button className="hero-primary-btn">
            <div className="hero-primary-btn-icon-wrap">▶</div>
            EXPLORE NOW
          </button>

          <GlowButton variant="outline">Browse Library</GlowButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />

      {/* ── Stats Bar — slides up after content ── */}
      <motion.div
        className="hero-stats-bar"
        initial="hidden"
        animate="visible"
        transition={{ delayChildren: 0.8, staggerChildren: 0.1 }}
        variants={{ hidden: {}, visible: {} }}
      >
        {[
          { num: '12', unit: 'K+', label: 'Anime Series' },
          { num: '48', unit: 'K+', label: 'Episodes' },
          { num: '2',  unit: 'M+', label: 'Members' },
        ].map((s, i) => (
          <motion.div key={i} className="hero-stats-group" variants={statsVariants}>
            {i > 0 && (
              <div className="hero-stats-divider" />
            )}
            <div className="hero-stats-item">
              <div className="hero-stats-num">
                {s.num}<span className="hero-stats-unit">{s.unit}</span>
              </div>
              <div className="hero-stats-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
