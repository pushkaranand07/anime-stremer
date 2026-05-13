import React from 'react';

export default function EpisodeList({ episodes = [], currentEpisode, onEpisodeSelect }) {
  if (!episodes.length) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Episodes</h2>
          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-400">
            {episodes.length} TOTAL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {episodes.map((ep) => {
          const isActive = currentEpisode?.number === ep.number;
          return (
            <button
              key={ep.id}
              onClick={() => onEpisodeSelect(ep)}
              className={`
                relative group aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all duration-300
                ${isActive 
                  ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                  : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-black/60' : 'text-gray-500'}`}>
                EP
              </span>
              <span className={`text-lg font-black ${isActive ? 'text-black' : 'text-white'}`}>
                {ep.number}
              </span>
              
              {ep.isFiller && (
                <div className="absolute top-1 right-1">
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-black/20 text-black' : 'bg-red-500/20 text-red-500'}`}>
                    FILL
                  </span>
                </div>
              )}

              {/* Hover indicator */}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-500/0 group-hover:border-yellow-500/50 transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
