'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailParticle {
  x: number;
  y: number;
  id: number;
}

export function GlowTrail() {
  const [trail, setTrail] = useState<TrailParticle[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const idRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsEnabled(isDesktop && hasHover && !prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTimeRef.current < 60) return;
      lastTimeRef.current = now;

      const particle: TrailParticle = {
        x: e.clientX,
        y: e.clientY,
        id: idRef.current++,
      };

      setTrail((prev) => [...prev.slice(-10), particle]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isEnabled]);

  // حذف ذرات قدیمی
  useEffect(() => {
    if (trail.length === 0) return;
    const timer = setTimeout(() => {
      setTrail((prev) => prev.slice(1));
    }, 400);
    return () => clearTimeout(timer);
  }, [trail]);

  if (!isEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[4]" aria-hidden="true">
      <AnimatePresence>
        {trail.map((point) => (
          <motion.span
            key={point.id}
            className="absolute rounded-full bg-primary/40"
            style={{
              left: point.x,
              top: point.y,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}