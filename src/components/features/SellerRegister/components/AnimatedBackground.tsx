'use client';

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useRef, useMemo, useEffect, useState } from 'react';
import { AnimatedGrid } from '../svgs/DecorativeShapes';

export function AnimatedBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // ═══════════════════════════════════════════════
  // ⚡ همه هوک‌ها باید اینجا باشن (بدون شرط)
  // ═══════════════════════════════════════════════

  // پارالاکس اسکرول
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.6, 0.3]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  // پارالاکس موس
  const [isEnabled, setIsEnabled] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  // ⬇️ این‌ها حتماً باید اینجا باشن — نه داخل JSX و نه داخل شرط
  const xInverse = useTransform(smoothX, (v) => -v);

  // ─── ذرات شناور (memoized) ───
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
        color: ['bg-primary', 'bg-primary/60', 'bg-orange-400'][
          Math.floor(Math.random() * 3)
        ],
      })),
    []
  );

  // ─── تنظیم Event Listener ───
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const enabled = isDesktop && hasHover && !prefersReducedMotion;
    setIsEnabled(enabled);

    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x * 30);
      mouseY.set(y * 30);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // ═══════════════════════════════════════════════
  // 📦 Render
  // ═══════════════════════════════════════════════

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* ─── لایه ۱: گرید متحرک ─── */}
      <motion.div
        style={{ opacity, y: y1 }}
        className="absolute inset-0 text-primary/10"
      >
        <AnimatedGrid />
      </motion.div>

      {/* ─── لایه ۲: بلاب برند (راست بالا) ─── */}
      <motion.div
        style={{
          y: y1,
          // ⬇️ استفاده از motion value بدون شرط — React از اینکه همیشه همون hook باشه خوشحال می‌شه
          x: smoothX,
        }}
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px]"
      />

      {/* ─── لایه ۳: بلاب زرد (چپ پایین) ─── */}
      <motion.div
        style={{
          y: y2,
          x: xInverse,
        }}
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full bg-orange-500/10 blur-[140px]"
      />

      {/* ─── لایه ۴: بلاب میانی ─── */}
      <motion.div
        style={{
          y: y3,
          rotate,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]"
      />

      {/* ─── لایه ۵: ذرات شناور ─── */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ─── لایه ۶: نویز گرین ─── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015] mix-blend-overlay pointer-events-none">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}