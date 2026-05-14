import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mangaService } from '../services/mangaService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const MANGA_PROVIDERS = ['MangaPill', 'Mangahook', 'MangaKakalot', 'MangaDex'];

export default function MangaDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'MangaPill';

  const handleProviderChange = (event) => {
    setSearchParams({ provider: event.target.value });
  };

  const { data: manga, isLoading, isError } = useQuery({
    queryKey: ['manga-detail', id, provider],
    queryFn: () => mangaService.getMangaInfo(id, provider),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><LoadingSpinner /></div>;
  if (isError) return <div className="min-h-screen flex items-center justify-center bg-black text-red-500">Error loading manga details.</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black">
      {/* Banner */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <img 
          src={manga.image} 
          alt={manga.title}
          className="w-full h-full object-cover blur-sm scale-110 opacity-30"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-64 relative z-20">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Cover */}
          <div className="w-64 flex-shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img src={manga.image} alt={manga.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
              {manga.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
              {manga.genres?.map(genre => (
                <span key={genre} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {genre}
                </span>
              ))}
            </div>
            <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-black">Provider</span>
              <select
                value={provider}
                onChange={handleProviderChange}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-yellow-500 transition-all"
              >
                {MANGA_PROVIDERS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-3xl mb-8 line-clamp-6 md:line-clamp-none">
              {manga.description}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-white/5">
              <div>
                <span className="block text-[10px] font-black text-gray-500 uppercase">Status</span>
                <span className="text-sm font-bold text-white">{manga.status}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-gray-500 uppercase">Release</span>
                <span className="text-sm font-bold text-white">{manga.releaseDate || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="mt-24">
          <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-widest flex items-center gap-4">
            Chapters <span className="text-xs text-gray-500">{manga.chapters?.length} TOTAL</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {manga.chapters?.map((chapter) => (
              <Link 
                key={chapter.id}
                to={`/manga/${id}/read/${encodeURIComponent(chapter.id)}?provider=${provider}`}
                className="group p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-yellow-500 hover:border-yellow-500 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 group-hover:text-black/60 uppercase">Chapter {chapter.chapterNumber}</span>
                  <span className="text-sm font-bold text-white group-hover:text-black line-clamp-1">{chapter.title || `Chapter ${chapter.chapterNumber}`}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                   <svg className="w-4 h-4 text-white group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                   </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
