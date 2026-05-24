import { motion } from 'framer-motion';
import AnimeCard from './AnimeCard';
import '../styles/trending-section.css';

export default function TrendingSection({ animeList }) {
  return (
    <section className="trending-section">
      <div className="trending-header">
        <div>
          <h2 className="trending-title">
            <span className="trending-title-icon">✦</span> TRENDING NOW
          </h2>
          <p className="trending-subtitle">The most popular anime this week</p>
        </div>
        <button className="trending-view-all">
          VIEW ALL →
        </button>
      </div>

      <div className="trending-carousel">
        {animeList.map((anime, i) => (
          <motion.div key={anime.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}>
            <AnimeCard anime={anime} rank={i + 1} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}