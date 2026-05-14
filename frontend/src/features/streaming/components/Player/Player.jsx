import { useEffect, useRef } from 'react';
import { MediaPlayer, MediaProvider, Poster, Track } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

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
  const player = useRef(null);

  // Convert sources to Vidstack format
  const streamSources = sources.map(s => ({
    src: s.url,
    type: s.isM3U8 || s.url.includes('.m3u8') ? 'application/x-mpegurl' : 'video/mp4',
    label: s.quality || 'Default'
  }));

  // Handle errors
  const onMediaError = (event) => {
    console.error('[Vidstack Player] Error:', event);
    if (onError) onError(event);
  };

  // Sync start time
  useEffect(() => {
    if (player.current && startTime > 0) {
      player.current.currentTime = startTime;
    }
  }, [startTime, sources]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
      <MediaPlayer
        ref={player}
        title={title}
        src={streamSources}
        crossOrigin
        playsInline
        onTimeUpdate={(detail) => {
          if (onTimeUpdate) onTimeUpdate(detail.currentTime, detail.duration);
        }}
        onEnded={onEnded}
        onError={onMediaError}
        className="w-full h-full"
        style={{ width: '100%', aspectRatio: '16/9' }}
      >
        <MediaProvider>
          <Poster
            className="vds-poster absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
            src={poster}
            alt={title}
          />
          {subtitles.map((sub, i) => (
            <Track
              key={i}
              src={sub.url}
              label={sub.lang || sub.language || 'English'}
              lang={(sub.lang || 'en').slice(0, 2)}
              kind="subtitles"
              default={sub.lang === 'English' || i === 0}
            />
          ))}
        </MediaProvider>

        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
