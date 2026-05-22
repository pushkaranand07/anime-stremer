import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * A hook that refreshes GSAP ScrollTrigger calculation bounds
 * when asynchronous elements have finished rendering and painting.
 * 
 * @param {Array} dependencies - Array of dependencies (e.g. [!loading, !!data]) to trigger a refresh.
 */
export function useScrollTriggerRefresh(dependencies = []) {
  useEffect(() => {
    // Only refresh when all dependencies evaluate to truthy values (loaded)
    const allReady = dependencies.every(Boolean);
    if (!allReady) return;

    let raf;
    const refresh = () => {
      // Defer execution by two frames so React renders and browser paints the new heights
      raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
    };

    // Trigger immediately if page loads, or listen for full media load events
    if (document.readyState === 'complete') {
      refresh();
    } else {
      window.addEventListener('load', refresh, { once: true });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
}
