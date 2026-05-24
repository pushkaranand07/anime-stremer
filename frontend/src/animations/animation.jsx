import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(MotionPathPlugin);
}

// Lenis integration wrapper to prevent import crashes
const lenisStart = () => {
  if (typeof window !== 'undefined' && window.lenis) {
    window.lenis.start();
  }
};

// React ref helper to extract elements cleanly
const getElement = (refOrElement) => {
  if (!refOrElement) return null;
  if (refOrElement.current) return refOrElement.current;
  return refOrElement;
};

const displayNone = (id) => {
  gsap.set(id, { display: 'none' });
  lenisStart();
};

const samsungErrorModal = (show = false) => {
  if (show) {
    gsap.to('#samsung-error-modal', {
      opacity: 1,
      delay: 1.5,
      duration: 1,
      ease: 'power4.inOut',
      onComplete: () => {
        gsap.to('#samsung-error-modal', {
          opacity: 0,
          delay: 12,
          duration: 1,
          ease: 'power4.inOut',
          onComplete: () => {
            displayNone('#samsung-error-modal');
          },
        });
      },
    });
  }
};

const animateSplitText = (
  id,
  textId,
  duration = 0.6,
  stagger = 0.01,
  delay = 0,
  onStartFn = () => { },
) => {
  gsap.to(id, {
    scrollTrigger: {
      trigger: textId, // Stable parent container wrapper as the trigger, not the letters NodeList
      toggleActions: 'play none none reverse',
      start: 'top bottom', // Trigger immediately as it enters the viewport
    },
    onStart: () => {
      // Extremely fast fade in for the container to feel reactive
      gsap.to(textId, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      onStartFn();
    },
    delay: delay,
    duration: duration,
    y: 0,
    autoAlpha: 1,
    stagger: stagger,
    ease: 'power4.out', // Snappiest exit ease
  });
};

const navbarScale = (selector, trigger) => {
  // If viewport is greater than 1024px (desktop), keep the burger menu hidden to prevent overlapping with auth buttons
  if (typeof window !== 'undefined' && window.innerWidth > 1024) {
    gsap.set(selector, { scale: 0, opacity: 0 });
    return;
  }

  // On mobile/tablet (<= 1024px), keep the burger menu always visible
  gsap.set(selector, { scale: 1, opacity: 1 });
};

// ! common animations
const yToZero = (id) => {
  gsap.to(id, {
    y: 0,
    duration: 0.4,
    ease: 'power1.inOut',
    stagger: 0.1,
  });
};

const xToZero = (id) => {
  gsap.to(id, {
    x: 0,
    duration: 0.4,
    ease: 'power1.inOut',
    stagger: 0.1,
    scrollTrigger: {
      trigger: id,
      toggleActions: 'play none none reverse',
    },
  });
};

const yReset = (id) => {
  gsap.set(id, {
    y: '100%',
  });
};

const fadeIn = (id, opacity = 1, duration = 0.5) => {
  gsap.to(id, {
    opacity: opacity,
    duration: duration,
    ease: 'power4.inOut',
    stagger: 0.1,
  });
};

const resetOpacity = (id, opacity = 0) => {
  gsap.set(id, {
    opacity: opacity,
  });
};

// ! Magneto effects
const activateMagneto = (
  event,
  magneto,
  magnetoText,
  magnetoStrengthVal,
  magnetoTextStrengthVal,
) => {
  const magnetoEl = getElement(magneto);
  const magnetoTextEl = getElement(magnetoText);
  if (!magnetoEl || !magnetoTextEl) return;

  const xDivTo = gsap.quickTo(magnetoEl, 'x', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });
  const xTextTo = gsap.quickTo(magnetoTextEl, 'x', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });

  const yTextTo = gsap.quickTo(magnetoTextEl, 'y', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });
  const yDivTo = gsap.quickTo(magnetoEl, 'y', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });

  const { clientX, clientY } = event;
  const { width, height, left, top } = magnetoEl.getBoundingClientRect();

  const magnetoStrength = magnetoStrengthVal;
  const magnetoTextStrength = magnetoTextStrengthVal;
  const newX = ((clientX - left) / width - 0.5) * magnetoStrength;
  const newY = ((clientY - top) / height - 0.5) * magnetoTextStrength;

  // move the magneto
  xDivTo(newX);
  yDivTo(newY);

  // move the text
  xTextTo(newX);
  yTextTo(newY);
};

const resetMagneto = (magneto, magnetoText) => {
  const magnetoEl = getElement(magneto);
  const magnetoTextEl = getElement(magnetoText);
  if (!magnetoEl || !magnetoTextEl) return;

  const xDivTo = gsap.quickTo(magnetoEl, 'x', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });
  const xTextTo = gsap.quickTo(magnetoTextEl, 'x', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });

  const yTextTo = gsap.quickTo(magnetoTextEl, 'y', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });
  const yDivTo = gsap.quickTo(magnetoEl, 'y', {
    duration: 1,
    ease: 'elastic.out(1, 0.3)',
  });

  xDivTo(0);
  yDivTo(0);

  // move the text
  xTextTo(0);
  yTextTo(0);
};

// ! Nav animation
const navbarEnter = (id) => {
  gsap.to(id, {
    x: '0%',
    autoAlpha: 1,
    duration: 0.7,
  });
};

const navbarLeave = (id) => {
  const x = '100%';
  gsap.to(id, {
    autoAlpha: 0,
    duration: 0.5,
    onComplete: () => {
      gsap.set(id, {
        x: x,
      });
    },
  });
};

const animateNavbarEnter = (
  navbarSelector,
  navbarLinksSelector,
  contactSelector,
) => {
  navbarEnter(navbarSelector);
  yToZero(navbarLinksSelector);
  fadeIn(contactSelector);
};

const animateNavbarLeave = (
  navbarSelector,
  navbarLinksSelector,
  contactSelector,
) => {
  navbarLeave(navbarSelector);
  yReset(navbarLinksSelector);
  resetOpacity(contactSelector);
};

// ! Loading animation
const animateLoadingPath = (
  path,
  targetPath,
  isSamsung,
) => {
  const pathEl = getElement(path);
  if (!pathEl) return;

  const tl = gsap.timeline({});
  tl.to('#loading-screen', {
    delay: 2, // Reduced from 3s to 2s to feel faster
    bottom: '100%',
    duration: 1,
    ease: 'power2.inOut',
    onStart: () => {
      setTimeout(() => {
        animateHeroNav();
        samsungErrorModal(isSamsung);
        document.body.classList.remove('stop-scrolling');
        window.scrollTo(0, 0);
      }, 120);
    },
  });

  tl.to(
    pathEl,
    {
      duration: 1,
      attr: { d: targetPath },
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set('#loading-screen', { display: 'none' });
      },
    },
    '<20%',
  );
};

const animateLoadingTextContainer = () => {
  gsap.fromTo(
    '#text',
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'circ.inOut',
    },
  );
};

const animateLoadingText = (id) => {
  gsap.to(id, {
    y: 0,
    duration: 1,
    ease: 'power2.inOut',
    delay: 0.5,
    stagger: 0.1,
    onComplete: () => {
      gsap.to(id, {
        delay: 1.2,
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(id, {
            y: '100%',
            opacity: 1,
          });
        },
      });
    },
  });
};

// ! Hero
const animateHeroNav = () => {
  const mm = gsap.matchMedia();

  mm.add('(max-width: 767px)', () => {
    // Mobile animations: Immediate appearance for most elements to match loader feeling
    gsap.set(
      [
        'header',
        '#star',
        '#down-arrow',
        '#contact-btn',
        '#available-for-work',
        '#whoAmI .letters',
        '#profile-img',
      ],
      {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
      },
    );

    gsap.set('.overlay', { display: 'none' });

    gsap.to(['.svg-my-en-name g path', '.svg-my-en-name text', '.mobile-name-bg text'], {
      y: 0,
      duration: 1.2,
      ease: 'power4.inOut',
      stagger: 0.005,
    });
  });

  mm.add('(min-width: 768px)', () => {
    // Desktop animations (Original logic)
    gsap.to('header', {
      y: 0,
      duration: 1.5,
      ease: 'power4.inOut',
    });

    gsap.to(['.svg-my-en-name g path', '.svg-my-en-name text', '.mobile-name-bg text'], {
      y: 0,
      delay: 0.2,
      duration: 1.5,
      ease: 'power4.inOut',
      stagger: 0.01,
    });

    gsap.to('#star', {
      x: 1,
      delay: 0.2,
      duration: 1.5,
      ease: 'power4.inOut',
    });

    gsap.to('.overlay', {
      y: '100%',
      delay: 0.2,
      duration: 1.5,
      ease: 'power4.inOut',
      onComplete: () => {
        gsap.set('.overlay', { display: 'none' });
      },
    });

    gsap.to('#profile-img', {
      scale: 1,
      delay: 0.4,
      duration: 1.5,
      ease: 'power4.inOut',
    });

    gsap.to(['#down-arrow', '#contact-btn', '#available-for-work'], {
      x: 0,
      y: 0,
      delay: 0.2,
      duration: 1.2,
      ease: 'power4.out',
    });

    animateSplitText('#whoAmI .letters', '#whoAmI .letters', 1.0, 0.005, 0.2);
  });

  // Hero scroll animation (Common for both)
  gsap.to('#hero', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      scrub: 1,
    },
    opacity: 0.5,
    scale: 0.9,
    translateZ: 0,
  });
};

// A little bit about me animation
const animateAboutMeSectionLeave = (id) => {
  gsap.to(id, {
    yPercent: -10,
    scale: 0.95,
    ease: 'power1',
    scrollTrigger: {
      trigger: id,
      start: '75% bottom',
      scrub: 1,
    },
  });
};

export {
  displayNone,
  xToZero,
  navbarScale,
  activateMagneto,
  resetMagneto,
  animateNavbarEnter,
  animateNavbarLeave,
  animateLoadingPath,
  animateLoadingText,
  animateLoadingTextContainer,
  animateHeroNav,
  animateSplitText,
  animateAboutMeSectionLeave,
};
