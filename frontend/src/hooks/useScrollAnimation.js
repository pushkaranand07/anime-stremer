import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin once globally
gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (animationConfig) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create the animation using gsap.context() — crucial for React cleanup
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: animationConfig.start || 'top 80%',
        end: animationConfig.end || 'bottom 20%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.to(element, {
            opacity: animationConfig.opacity || 1,
            y: animationConfig.y || 0,
            duration: animationConfig.duration || 0.8,
            ease: animationConfig.ease || 'power2.out',
          });
        },
        onLeaveBack: () => {
          gsap.to(element, {
            opacity: 0,
            y: animationConfig.yOut || 50,
            duration: 0.5,
          });
        },
        ...(animationConfig.scrub && { scrub: animationConfig.scrub }),
      });
    }, elementRef);

    // Cleanup to prevent memory leaks
    return () => ctx.revert();
  }, [animationConfig]);

  return elementRef;
};
