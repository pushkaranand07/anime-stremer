import { motion } from 'framer-motion';

/**
 * ScrollReveal — wraps any section in a smooth scroll-triggered entrance.
 *
 * Props:
 *  children   — content to reveal
 *  direction  — 'up' | 'down' | 'left' | 'right'  (default: 'up')
 *  distance   — px to travel from hidden → visible  (default: 48)
 *  delay      — seconds before animation starts     (default: 0)
 *  duration   — seconds for the transition          (default: 0.65)
 *  threshold  — 0–1 how much of element is visible  (default: 0.12)
 *  once       — only play once (default: true)
 *  className  — forwarded to wrapper div
 */
export default function ScrollReveal({
  children,
  direction = 'up',
  distance  = 48,
  delay     = 0,
  duration  = 0.65,
  threshold = 0.12,
  once      = true,
  className = '',
}) {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const sign = direction === 'down' || direction === 'right' ? -1 : 1;

  const hidden  = { opacity: 0, [axis]: sign * distance };
  const visible = { opacity: 1, [axis]: 0 };

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // smooth cubic-bezier
      }}
    >
      {children}
    </motion.div>
  );
}
