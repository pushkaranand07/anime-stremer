export default function GlowButton({ children, onClick, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      className={`glow-btn glow-btn-${variant}`}
    >
      {children}
    </button>
  );
}