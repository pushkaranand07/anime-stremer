import { useFavorites } from '../context/FavoritesContext';
import AnimeCard from '../../anime-catalog/components/AnimeCard';
import MagnetButton from '../../../components/ui/MagnetButton';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <div className="py-20 min-h-screen max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-white tracking-tight">MY FAVORITES</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Your personal collection of must-watch anime. These are saved securely to your account database.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {favorites.map(fav => (
            <AnimeCard 
              key={fav.animeId} 
              anime={{
                mal_id: fav.animeId,
                title: fav.title,
                images: { jpg: { large_image_url: fav.imageUrl, image_url: fav.imageUrl } },
                score: fav.score,
                episodes: fav.episodes
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10 max-w-3xl mx-auto">
          <div className="text-6xl mb-6">📂</div>
          <h2 className="text-2xl font-bold text-white mb-4">Your collection is empty</h2>
          <p className="text-gray-400 mb-10 max-w-sm mx-auto">
            Start exploring and click the "Add to Favorites" button on any anime page to build your list.
          </p>
          <MagnetButton onClick={() => navigate('/')}>
             Explore Anime
          </MagnetButton>
        </div>
      )}
      
      {favorites.length > 0 && (
         <div className="mt-20 p-8 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 text-center">
            <p className="text-yellow-500 font-medium">
               You have {favorites.length} anime in your collection. Keep it up!
            </p>
         </div>
      )}
    </div>
  );
}
