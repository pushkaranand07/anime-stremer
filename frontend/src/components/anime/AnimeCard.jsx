import { Link, useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

export default function AnimeCard({ anime, index }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const favorited = isFavorite(anime.mal_id);

  const cardRef = useScrollAnimation({
    start: 'top 95%',
    opacity: 1,
    y: 0,
    duration: 0.6,
    yOut: 30,
  });

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (favorited) {
      removeFavorite(anime.mal_id);
    } else {
      addFavorite(anime);
    }
  };

  return (
    <Link to={`/anime/${anime.mal_id}`} ref={cardRef} className="relative block group opacity-0 translate-y-[30px]">
      <div className="relative overflow-hidden rounded-xl bg-gray-900 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 border border-white/5 hover:border-white/20">
        {/* Favorite Button */}
        <button 
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            favorited ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-white hover:text-black'
          }`}
        >
          {favorited ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        {/* Image with gradient overlay */}
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="absolute bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full">
          <h3 className="text-sm font-bold text-white line-clamp-2 mb-2">{anime.title}</h3>
          <div className="flex items-center gap-3 text-xs text-yellow-400 font-semibold">
            <span className="flex items-center gap-1">⭐ {anime.score || 'N/A'}</span>
            <span className="text-gray-400">|</span>
            <span>🎬 {anime.episodes || '?'} eps</span>
          </div>
        </div>

        {/* Static Info (Visible when not hovering) */}
        <div className="p-3 group-hover:opacity-0 transition-opacity duration-300">
           <h3 className="text-sm font-bold text-white line-clamp-1">{anime.title}</h3>
           <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 uppercase tracking-wider">
             <span>{anime.type}</span>
             <span className="text-yellow-500/80">⭐ {anime.score || 'N/A'}</span>
           </div>
        </div>
      </div>
    </Link>
  );
}
