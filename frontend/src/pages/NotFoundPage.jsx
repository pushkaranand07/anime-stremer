import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import MagnetButton from '../components/ui/MagnetButton';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const textRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(textRef.current, 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />
      </div>

      <div ref={textRef} className="relative z-10 text-center max-w-2xl">
        <h1 className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter text-white/5 select-none">
          404
        </h1>
        <div className="-mt-16 md:-mt-24">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight uppercase">
            Lost in the <span className="text-yellow-500">Multiverse?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 leading-relaxed max-w-lg mx-auto">
            The page you're looking for has moved to another dimension or never existed in this timeline.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <MagnetButton onClick={() => navigate('/')} className="px-12 py-5 text-lg">
              BACK TO BASE
            </MagnetButton>
            <button 
              onClick={() => navigate(-1)}
              className="text-white/60 hover:text-white font-bold tracking-widest text-xs uppercase transition-colors"
            >
              PREVIOUS TIMELINE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
