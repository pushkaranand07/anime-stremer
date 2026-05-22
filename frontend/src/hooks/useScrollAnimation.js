import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * A custom hook to trigger GSAP scroll animations on a DOM element.
 * Safe for React asynchronous loading states using callback refs.
 * 
 * @param {boolean} isLoading - State that postpones mounting ScrollTrigger until rendering is complete.
 * @param {Object} animationConfig - Custom animation variables like start, end, opacity, ease, etc.
 * @returns {Function} A callback ref (setRef) to attach to the target DOM node.
 */
export function useScrollAnimation(isLoading = false, animationConfig = {}) {
  const elementRef = useRef(null);

  // Callback ref that executes whenever the DOM element mounts or unmounts
  const setRef = useCallback((node) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    // Only initialize the animation when data loading is finished and the node is fully mounted
    if (isLoading || !elementRef.current) return;

    const element = elementRef.current;
    
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: animationConfig.start || 'top 80%',
        end: animationConfig.end || 'bottom 20%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.to(element, {
            opacity: animationConfig.opacity !== undefined ? animationConfig.opacity : 1,
            y: animationConfig.y !== undefined ? animationConfig.y : 0,
            duration: animationConfig.duration || 0.8,
            ease: animationConfig.ease || 'power2.out',
          });
        },
        onLeaveBack: () => {
          gsap.to(element, {
            opacity: 0,
            y: animationConfig.yOut !== undefined ? animationConfig.yOut : 50,
            duration: 0.5,
          });
        },
        ...(animationConfig.scrub && { scrub: animationConfig.scrub }),
      });
    }, element);

    // Revert context and clean up to prevent memory leaks on state changes
    return () => ctx.revert();
  }, [isLoading, animationConfig.start, animationConfig.end, animationConfig.opacity, animationConfig.y, animationConfig.duration, animationConfig.ease, animationConfig.yOut, animationConfig.scrub]);

  return setRef;
}

