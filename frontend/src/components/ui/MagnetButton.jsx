import { useRef } from 'react';
import gsap from 'gsap';

export default function MagnetButton({ children, className = '', onClick }) {
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();

    const x = (clientX - (left + width / 2)) * 0.4;
    const y = (clientY - (top + height / 2)) * 0.4;

    gsap.to(buttonRef.current, {
      x: x,
      y: y,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
      overwrite: true,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  return (
    <button
      ref={buttonRef}
      className={`relative group inline-flex items-center justify-center px-8 py-4 font-bold text-black transition-all duration-300 rounded-full bg-yellow-500 hover:bg-yellow-400 active:scale-95 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
    </button>
  );
}
