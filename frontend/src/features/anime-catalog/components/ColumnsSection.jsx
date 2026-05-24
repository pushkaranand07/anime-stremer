import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useColumnsSectionData } from '../hooks/useHomepageCatalog';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import '../styles/columns-section.css';

// Container: triggers stagger on children when it enters the viewport
const colContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// Each column fades up
const colVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Each row card inside a column fades up with a tiny cascade
const rowVariants = (i) => ({
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' } },
});

// Deduplicate a list of anime objects by mal_id.
// The 'currently airing' and 'recently ended' Jikan endpoints can return
// overlapping entries, which causes React duplicate-key warnings.
const dedup = (arr) =>
  arr ? Array.from(new Map(arr.map(item => [item.mal_id, item])).values()) : [];

export default function ColumnsSection() {
  const navigate = useNavigate();
  const { data: lists, isLoading, isError } = useColumnsSectionData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !lists) {
    return null; // Silent fallback if API error
  }

  const handleItemClick = (id) => {
    navigate(`/anime/${id}`);
  };

  const renderColumn = (title, data, colDelay = 0) => (
    <motion.div className="list-column-col" variants={colVariants}>
      <div className="list-column-header">
        <h3 className="column-title-label">
          {title} <span className="column-title-arrow">→</span>
        </h3>
      </div>

      <div className="column-rows-list">
        {dedup(data).slice(0, 5).map((anime, index) => {
          const epCount = anime.episodes || '?';
          const releaseYear = anime.year || anime.aired?.prop?.from?.year || '2026';

          return (
            <motion.div
              key={`${anime.mal_id}-${index}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={rowVariants(index)}
              onClick={() => handleItemClick(anime.mal_id)}
              className="column-row-card"
            >
              <div className="row-card-thumb-wrap">
                <img
                  src={anime.images?.jpg?.image_url || anime.images?.jpg?.small_image_url}
                  alt={anime.title}
                  className="row-card-thumb"
                />
              </div>

              <div className="row-card-info">
                <h4 className="row-card-title" title={anime.title_english || anime.title}>
                  {anime.title_english || anime.title}
                </h4>
                <div className="row-card-meta">
                  <span className="row-meta-badge ep">CC {epCount}</span>
                  <span className="row-meta-badge type">{anime.type || 'TV'}</span>
                  <span className="row-meta-year">• {releaseYear}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <section className="columns-section-container">
      <motion.div
        className="columns-grid-layout"
        variants={colContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
      >
        {renderColumn('NEW RELEASE',   lists.newReleases)}
        {renderColumn('NEW ADDED',     lists.newAdded)}
        {renderColumn('JUST COMPLETED', lists.justCompleted)}
      </motion.div>
    </section>
  );
}
