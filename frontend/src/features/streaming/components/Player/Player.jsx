import { useRef, useEffect } from 'react';
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

  // Get the primary source (prioritize M3U8 for HLS streaming)
  const primarySource = sources.find(s => s.url.includes('.m3u8'))?.url || sources[0]?.url;

  // Handle seeking to start time when source loads
  useEffect(() => {
    if (playerRef.current && startTime > 0) {
      // Small delay to ensure player is ready
      const timer = setTimeout(() => {
        playerRef.current.seekTo(startTime, 'seconds');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startTime, primarySource]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
      <ReactPlayer
        ref={playerRef}
        url={primarySource}
        width="100%"
        height="100%"
        controls
        playing={false}
        pip={true}
        stopOnUnmount={false}
        light={poster} // Shows poster before play, extremely smooth for UX
        playIcon={
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/40 transform hover:scale-110 transition-transform">
             <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
             </svg>
          </div>
        }
        onProgress={({ playedSeconds }) => {
          if (onTimeUpdate) {
            // We don't have total duration in this callback easily, 
            // but the hook only needs playedSeconds for progress tracking
            onTimeUpdate(playedSeconds, 0); 
          }
        }}
        onEnded={onEnded}
        onError={(err) => {
          console.error('[ReactPlayer] Error:', err);
          if (onError) onError(err);
        }}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
              style: { width: '100%', height: '100%', objectFit: 'contain' }
            },
            forceHLS: primarySource?.includes('.m3u8'),
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
