import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedCounter({ targetValue, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({}, {
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            const progress = this.progress();
            setCount(Math.floor(targetValue * progress));
          },
          onComplete: () => setCount(targetValue),
        });
        trigger.kill(); // Kill after first trigger so it doesn't run again
      },
    });

    return () => trigger.kill();
  }, [targetValue]);

  return (
    <div ref={counterRef} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-400 text-sm font-medium uppercase tracking-widest">{label}</div>
    </div>
  );
}
