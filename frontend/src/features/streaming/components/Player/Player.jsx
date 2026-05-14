import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

export default function Player({ 
  sources = [], 
  subtitles = [], 
  poster = '', 
  title = '',
  startTime = 0,
  onTimeUpdate,
  onEnded,
  onError 
}) {
  const playerRef = useRef(null);
  const [playerError, setPlayerError] = useState(null);

  // Get the primary source (prioritize M3U8 for HLS streaming)
  const primarySource = sources.find(s => s.url.includes('.m3u8'))?.url || sources[0]?.url;

  // Reset error when source changes
  useEffect(() => {
    setPlayerError(null);
  }, [primarySource]);

  // Handle seeking to start time when source loads
  useEffect(() => {
    if (playerRef.current && startTime > 0) {
      const timer = setTimeout(() => {
        playerRef.current.seekTo(startTime, 'seconds');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startTime, primarySource]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 group">
      {playerError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-8 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-3xl">
             ⚠️
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Playback Failed</h3>
          <p className="text-gray-400 text-xs max-w-sm mb-6 leading-relaxed">
            {playerError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-white text-black text-xs font-black rounded-xl hover:bg-yellow-500 transition-all"
          >
            RELOAD PLAYER
          </button>
        </div>
      )}

      <ReactPlayer
        ref={playerRef}
        url={primarySource}
        width="100%"
        height="100%"
        controls={true}
        playing={false}
        pip={true}
        stopOnUnmount={false}
        light={poster} 
        playIcon={
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/40 transform hover:scale-110 transition-transform">
             <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
             </svg>
          </div>
        }
        onProgress={({ playedSeconds }) => {
          if (onTimeUpdate) onTimeUpdate(playedSeconds, 0); 
        }}
        onEnded={onEnded}
        onError={(err) => {
          console.error('[Player Error]', err);
          setPlayerError('The video source could not be reached. Try switching providers.');
          if (onError) onError(err);
        }}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
              style: { width: '100%', height: '100%', objectFit: 'contain' }
            },
            forceHLS: true,
            hlsOptions: {
              enableWorker: true,
              lowLatencyMode: true,
            },
            tracks: subtitles.map(sub => ({
              kind: 'subtitles',
              src: sub.url,
              srcLang: (sub.lang || 'en').slice(0, 2),
              label: sub.lang || 'English',
              default: sub.lang === 'English'
            }))
          }
        }}
      />
    </div>
  );
}
