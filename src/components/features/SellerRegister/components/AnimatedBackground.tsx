'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { AnimatedGrid } from '../svgs/DecorativeShapes';

export function AnimatedBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.6, 0.3]);

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* گرید متحرک */}
      <motion.div style={{ opacity }} className="absolute inset-0 text-primary/10">
        <AnimatedGrid />
      </motion.div>

      {/* بلاب‌های رنگی */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-40 -right-40 w-[31.25rem] h-[31.25rem] rounded-full bg-primary/10 blur-[6.25rem]"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -bottom-40 -left-40 w-[37.5rem] h-[37.5rem] rounded-full bg-primary/10 blur-[7.5rem]"
      />

      {/* ذرات شناور */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-primary/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}