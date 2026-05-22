import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '12px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}