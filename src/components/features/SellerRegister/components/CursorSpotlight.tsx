'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CursorSpotlight() {
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const [isEnabled, setIsEnabled] = useState(false);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const checkDevice = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsEnabled(isDesktop && hasHover && !prefersReducedMotion);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkDevice);
    };
  }, [mouseX, mouseY]);

  if (!isEnabled) return null;

  return (
    <>
      {/* هاله گرادیانت بزرگ */}
      <motion.div
        className="pointer-events-none fixed w-[600px] h-[600px] rounded-full -translate-x-1/2 -translate-y-1/2 z-[5]"
        aria-hidden="true"
        style={{
          left: springX,
          top: springY,
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 60%)',
        }}
      />
      {/* نقطه مرکزی */}
      <motion.div
        className="pointer-events-none fixed w-3 h-3 rounded-full bg-primary/40 blur-sm -translate-x-1/2 -translate-y-1/2 z-[5]"
        aria-hidden="true"
        style={{
          left: springX,
          top: springY,
        }}
      />
    </>
  );
}