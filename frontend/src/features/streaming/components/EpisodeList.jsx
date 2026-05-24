import React from 'react';

export default function EpisodeList({ episodes = [], currentEpisode, onEpisodeSelect }) {
  if (!episodes.length) return null;

  return (
    <div className="episodes-container">
      <div className="episodes-header">
        <div className="episodes-title-wrapper">
          <div className="episodes-title-bar" />
          <h2 className="episodes-title">Episodes</h2>
          <span className="episodes-count-badge">
            {episodes.length} TOTAL
          </span>
        </div>
      </div>

      <div className="episodes-grid">
        {episodes.map((ep) => {
          const isActive = currentEpisode?.number === ep.number;
          return (
            <button
              key={ep.id}
              onClick={() => onEpisodeSelect(ep)}
              className={`episode-btn ${isActive ? 'active' : ''}`}
            >
              <span className={`episode-btn-label ${isActive ? 'active' : ''}`}>
                EP
              </span>
              <span className={`episode-btn-number ${isActive ? 'active' : ''}`}>
                {ep.number}
              </span>
              
              {ep.isFiller && (
                <span className={`episode-filler-badge ${isActive ? 'active' : ''}`}>
                  FILL
                </span>
              )}

              {/* Hover indicator */}
              {!isActive && <div className="episode-hover-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
