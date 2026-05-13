import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { fetchEpisodeSources } from '../../services/streamingService';

export default function VideoPlayer({ episode, provider, hasDub, onEnded }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [subOrDub, setSubOrDub] = useState('sub');
  const [sources, setSources] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [intro, setIntro] = useState(null);

  // ── Load sources whenever the episode or sub/dub preference changes ────
  const loadSources = useCallback(async () => {
    if (!episode?.id) return;
    setLoading(true);
    setError(null);
    setSources([]);

    try {
      const data = await fetchEpisodeSources(episode.id, provider, subOrDub);
      if (!data?.sources?.length) throw new Error('No playable sources returned.');
      setSources(data.sources);
      setSubtitles(data.subtitles || []);
      setIntro(data.intro || null);

      // Prefer 'auto' or the best quality available
      const hasAuto = data.sources.some(s => s.quality === 'auto' || s.quality === 'default');
      setSelectedQuality(hasAuto ? 'auto' : data.sources[0].quality);
    } catch (err) {
      console.error('[VideoPlayer] Source load failed:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load video sources.');
    } finally {
      setLoading(false);
    }
  }, [episode?.id, provider, subOrDub]);

  useEffect(() => { loadSources(); }, [loadSources]);

  // ── Mount / swap HLS or MP4 source whenever sources or quality changes ─
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sources.length) return;

    // Find the matching quality source
    let src = sources.find(s => s.quality === selectedQuality)
      || sources.find(s => s.quality === 'auto' || s.quality === 'default')
      || sources[0];

    if (!src?.url) return;

    // Destroy existing HLS instance
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    const isHLS = src.isM3U8 || src.url.includes('.m3u8');

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({ maxLoadingDelay: 4, lowLatencyMode: false });
      hls.loadSource(src.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else { hls.destroy(); setError('Stream playback error. Try a different quality.'); }
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src.url;
      video.play().catch(() => {});
    } else {
      // Direct MP4
      video.src = src.url;
      video.play().catch(() => {});
    }

    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [sources, selectedQuality]);

  // ── Render ───────────────────────────────────────────────────────────────
  if (!episode) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl text-yellow-500">
          ▶
        </div>
        <p className="text-sm font-bold text-gray-300">Select an episode to start watching</p>
        <p className="text-xs text-gray-500">Powered by Consumet · HLS · Multi-Provider</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#060606]">

      {/* ── Player area ─────────────────────────────────────────────────── */}
      <div className="relative aspect-video w-full bg-black group">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 backdrop-blur-sm">
            <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-400">Extracting stream sources…</span>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/95 backdrop-blur-sm p-6 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="text-red-400 font-bold text-sm max-w-md">{error}</p>
            <p className="text-gray-500 text-xs max-w-sm">
              Streaming providers occasionally rotate mirrors. Try switching Sub/Dub or retry.
            </p>
            <button
              onClick={loadSources}
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-xl transition-all"
            >
              ↺ Retry
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          onEnded={onEnded}
          className="w-full h-full object-contain"
        >
          {/* Inject subtitle tracks from provider */}
          {subtitles.map((sub, i) => (
            <track
              key={i}
              kind="subtitles"
              label={sub.lang || sub.language || 'English'}
              srcLang={(sub.lang || 'en').slice(0, 2)}
              src={sub.url}
              default={i === 0}
            />
          ))}
        </video>

        {/* Quality badge — visible on hover */}
        {sources.length > 1 && !loading && !error && (
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur border border-white/10 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">Quality</span>
              <select
                value={selectedQuality}
                onChange={e => setSelectedQuality(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {sources.map((s, i) => (
                  <option key={i} value={s.quality} className="bg-gray-950">{s.quality?.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Controls bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0e0e0e] border-t border-white/5">
        {/* Now Playing info */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Now Playing</span>
          <span className="text-sm font-bold text-white truncate">
            Ep {episode.number}{episode.title && episode.title !== `Episode ${episode.number}` ? ` — ${episode.title}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub / Dub toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setSubOrDub('sub')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                subOrDub === 'sub' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              🇯🇵 SUB
            </button>
            <button
              onClick={() => setSubOrDub('dub')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                subOrDub === 'dub' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              🇺🇸 DUB
            </button>
          </div>

          {/* Provider badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400">{provider || 'Auto'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
