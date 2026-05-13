import { ReactLenis } from 'lenis/react';

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,          // Smoothing strength (lower = smoother)
        duration: 1.2,      // Animation duration in seconds
        smoothWheel: true,   // Enable smooth wheel scrolling
        smoothTouch: true,   // Enable smooth touch scrolling
      }}
    >
      {children}
    </ReactLenis>
  );
}
