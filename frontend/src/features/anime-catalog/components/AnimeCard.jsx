import { motion } from 'framer-motion';

export default function AnimeCard({ anime, rank, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{
        position: 'relative', borderRadius: '12px', overflow: 'hidden',
        cursor: 'pointer', flexShrink: 0, width: '160px',
        border: '1px solid rgba(124,58,237,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <img src={anime.image} alt={anime.title}
        style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(7,7,26,0.95) 0%, transparent 50%)',
      }} />

      {/* Rank number */}
      {rank && (
        <div style={{
          position: 'absolute', bottom: '48px', left: '12px',
          fontSize: '40px', fontWeight: 700, color: '#7c3aed',
          textShadow: '0 0 20px rgba(124,58,237,0.8)', lineHeight: 1
        }}>
          {String(rank).padStart(2, '0')}
        </div>
      )}

      {/* Title */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#f1f0ff', marginBottom: '2px' }}>
          {anime.title}
        </p>
        <p style={{ fontSize: '11px', color: '#6b7280' }}>{anime.episode}</p>
      </div>

      {/* Hover glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          position: 'absolute', inset: 0,
          boxShadow: 'inset 0 0 30px rgba(124,58,237,0.3)',
          borderRadius: '12px', pointerEvents: 'none'
        }}
      />
    </motion.div>
  );
}