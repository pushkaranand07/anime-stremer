import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mangaService } from '../services/mangaService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function MangaReaderPage() {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'MangaPill';

  const { data: pages, isLoading, isError } = useQuery({
    queryKey: ['manga-pages', chapterId, provider],
    queryFn: () => mangaService.getChapterPages(chapterId, provider),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><LoadingSpinner /></div>;
  if (isError) return <div className="min-h-screen flex items-center justify-center bg-black text-red-500">Error loading pages.</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md h-16 flex items-center justify-between px-6 border-b border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO INFO
        </button>
        <div className="hidden md:flex flex-col items-center text-center">
          <span className="text-white font-black uppercase text-xs tracking-widest">
            Reading Chapter
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400">
            Source: {provider}
          </span>
        </div>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Reader Container */}
      <div className="max-w-3xl mx-auto flex flex-col gap-0">
        {pages?.map((page, index) => (
          <div key={page.page} className="relative w-full group">
             <img 
              src={page.img} 
              alt={`Page ${page.page}`}
              className="w-full h-auto"
              loading={index < 3 ? "eager" : "lazy"}
            />
            {/* Page indicator on hover */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-white">PAGE {page.page}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Nav */}
      <div className="py-24 text-center">
         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏁</span>
         </div>
         <h3 className="text-xl font-black text-white uppercase tracking-tighter">END OF CHAPTER</h3>
         <button 
           onClick={() => navigate(-1)}
           className="mt-6 px-12 py-3 bg-yellow-500 text-black font-black rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10"
         >
           BACK TO CHAPTER LIST
         </button>
      </div>
    </div>
  );
}
