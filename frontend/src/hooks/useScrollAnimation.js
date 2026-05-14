import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin once globally
gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (animationConfig) => {
  const elementRef = useRef(null);
  const configRef = useRef(animationConfig);

  // Update config ref when config changes
  configRef.current = animationConfig;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create the animation using gsap.context() — crucial for React cleanup
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: configRef.current.start || 'top 80%',
        end: configRef.current.end || 'bottom 20%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.to(element, {
            opacity: configRef.current.opacity || 1,
            y: configRef.current.y || 0,
            duration: configRef.current.duration || 0.8,
            ease: configRef.current.ease || 'power2.out',
          });
        },
        onLeaveBack: () => {
          gsap.to(element, {
            opacity: 0,
            y: configRef.current.yOut || 50,
            duration: 0.5,
          });
        },
        ...(configRef.current.scrub && { scrub: configRef.current.scrub }),
      });
    }, elementRef.current);

    // Cleanup to prevent memory leaks
    return () => ctx.revert();
  }, []); // No dependencies since we use ref

  return elementRef;
};
