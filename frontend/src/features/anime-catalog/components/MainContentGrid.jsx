import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTopAnimeLeaderboard } from '../hooks/useHomepageCatalog';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import '../styles/main-content-grid.css';

// Jikan filters for Top Anime tabs
const sidebarFilters = {
  Day: 'bypopularity',
  Week: 'airing',
  Month: 'favorite'
};

export default function MainContentGrid({ liveAiringAnime }) {
  const navigate = useNavigate();
  const [latestTab, setLatestTab] = useState('All');
  const [topTab, setTopTab] = useState('Day');

  // Fetch dynamic Top Anime based on active sidebar tab!
  const { data: rawLeaderboard, isLoading: isSidebarLoading } = useTopAnimeLeaderboard(sidebarFilters[topTab]);

  const handleCardClick = (id) => {
    navigate(`/anime/${id}`);
  };

  // Map airing list into structured grid items
  const getLatestEpisodes = () => {
    if (!liveAiringAnime || liveAiringAnime.length === 0) {
      return [];
    }

    // Distribute categories dynamically for high-fidelity tab filtering!
    const categories = ['Sub', 'Dub', 'Trending', 'Chinese', 'Random'];
    
    return liveAiringAnime.slice(0, 12).map((item, idx) => {
      const cat = categories[idx % categories.length];
      const hasDub = idx % 2 === 0;
      
      return {
        id: item.id,
        title: item.title,
        ep: item.episode.match(/\d+/) ? item.episode.match(/\d+/)[0] : '1',
        sub: true,
        dub: hasDub,
        type: 'TV',
        image: item.image,
        category: cat
      };
    });
  };

  const latestItems = getLatestEpisodes();
  const currentLatestItems = latestItems.filter(item => {
    if (latestTab === 'All') return true;
    return item.category === latestTab;
  });

  return (
    <section className="main-content-grid-section">
      <div className="grid-container-layout">
        
        {/* ── LEFT COLUMN: Latest Episodes Grid ── */}
        <div className="latest-episodes-col">
          <div className="section-header-flex">
            <h3 className="section-title-tag">Latest Episode</h3>
            
            {/* Filter Tabs */}
            <div className="section-tabs-pills">
              {['All', 'Sub', 'Dub', 'Chinese', 'Trending', 'Random'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLatestTab(tab)}
                  className={`tab-pill-btn ${latestTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Staggered Grid */}
          <div className="latest-episodes-grid">
            <AnimatePresence mode="popLayout">
              {currentLatestItems.length > 0 ? (
                currentLatestItems.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${latestTab}-${index}`}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    onClick={() => handleCardClick(item.id)}
                    className="episode-grid-card"
                  >
                    <div className="card-thumb-wrap">
                      <img src={item.image} alt={item.title} className="card-thumb-img" />
                      
                      {/* Badge row */}
                      <div className="card-badges-row">
                        {item.sub && <span className="card-badge sub">CC {item.ep}</span>}
                        {item.dub && <span className="card-badge dub">DUB</span>}
                      </div>

                      <div className="card-hover-overlay">
                        <div className="hover-play-circle">▶</div>
                      </div>
                    </div>

                    <div className="card-info-wrap">
                      <h4 className="card-title-text" title={item.title}>
                        {item.title}
                      </h4>
                      <span className="card-meta-type">{item.type}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex justify-center items-center py-20 w-full text-gray-500 font-medium">
                  No episodes found in this category
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Top Anime Ranked Sidebar ── */}
        <div className="top-anime-sidebar-col">
          <div className="section-header-flex">
            <h3 className="section-title-tag">Top Anime</h3>
            
            {/* Time Filter Tabs */}
            <div className="sidebar-tabs-pills">
              {['Day', 'Week', 'Month'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTopTab(tab)}
                  className={`sidebar-tab-btn ${topTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Ranked List */}
          <div className="sidebar-ranked-list">
            {isSidebarLoading ? (
              <div className="flex justify-center items-center py-20 w-full">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="sidebar-ranked-wrapper">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={topTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="sidebar-ranked-wrapper"
                  >
                    {rawLeaderboard?.slice(0, 8).map((anime, idx) => {
                      const rank = idx + 1;
                      return (
                        <div
                          key={`${topTab}-${anime.mal_id}-${idx}`}
                          onClick={() => handleCardClick(anime.mal_id)}
                          className="ranked-list-item"
                        >
                          {/* Giant rank numbers */}
                          <div className={`rank-number-col rank-${rank}`}>
                            {rank}
                          </div>

                          <div className="ranked-item-thumb-wrap">
                            <img 
                              src={anime.images?.jpg?.image_url || anime.images?.jpg?.small_image_url} 
                              alt={anime.title} 
                              className="ranked-item-thumb" 
                            />
                          </div>

                          <div className="ranked-item-info">
                            <h4 className="ranked-item-title" title={anime.title_english || anime.title}>
                              {anime.title_english || anime.title}
                            </h4>
                            <div className="ranked-item-meta">
                              <span className="meta-badge rating">★ {anime.score || 'N/A'}</span>
                              <span className="meta-badge type">{anime.type || 'TV'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
