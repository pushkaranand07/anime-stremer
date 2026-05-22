import { ReactLenis, useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Subcomponent to register ScrollTrigger update handler with Lenis smooth scroll ticker
function ScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}


