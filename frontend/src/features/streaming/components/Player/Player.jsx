import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

export default function Player({
  sources = [],
  subtitles = [],
  poster = '',
  title = '',
  startTime = 0,
  onTimeUpdate,
  onEnded,
  onError,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [playerError, setPlayerError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Safely find the primary source — prefer M3U8/HLS, fall back to first available
  const m3u8Source = sources.find(s => typeof s.url === 'string' && s.url.includes('.m3u8'))?.url
    || sources.find(s => typeof s.url === 'string')?.url
    || null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !m3u8Source) return;

    setPlayerError(null);
    setIsReady(false);

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,            // Auto quality selection
        enableWorker: true,
      });

      hls.loadSource(m3u8Source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsReady(true);
        if (startTime > 0) video.currentTime = startTime;
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('[HLS Error]', data);
          setPlayerError('Stream error. Try switching providers.');
          if (onError) onError(data);
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = m3u8Source;
      video.addEventListener('loadedmetadata', () => {
        if (startTime > 0) video.currentTime = startTime;
        setIsReady(true);
      });
    } else {
      setPlayerError('HLS streaming is not supported in this browser.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [m3u8Source, startTime, onError]);

  // Attach callbacks via separate effect (avoids HLS recreation on cb change)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate && isReady) {
        onTimeUpdate(video.currentTime, video.duration);
      }
    };
    
    const handleEnded = () => {
      if (onEnded) onEnded();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onEnded, isReady]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 group">
      {playerError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-8 text-center">
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

      {!m3u8Source && !playerError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm">No video source available</p>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain focus:outline-none"
        poster={poster}
        controls
        playsInline
        crossOrigin="anonymous"
        style={{ display: m3u8Source ? 'block' : 'none' }}
      >
        {subtitles.map((sub, index) => (
          <track
            key={index}
            kind="subtitles"
            src={sub.url}
            srcLang={(sub.lang || 'en').slice(0, 2)}
            label={sub.lang || 'English'}
            default={sub.lang === 'English'}
          />
        ))}
      </video>
    </div>
  );
}
