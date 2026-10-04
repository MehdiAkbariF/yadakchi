'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { cn } from '@/design-system/utils/cn';
import { FeatureIconMap } from '../svgs/FeatureIcons';

interface FeatureCardProps {
  feat: {
    id: string;
    title: string;
    desc: string;
    color: string;
  };
  index: number;
}

export function FeatureCard({ feat, index }: FeatureCardProps) {
  const IconComponent = FeatureIconMap[feat.id as keyof typeof FeatureIconMap];
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // ─── 3D Tilt با موس ───
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovering(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative"
      style={{ perspective: 1000 }}
    >
      {/* Glow پشت کارت */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500" />

      {/* Border گرادیانت */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-border/80 to-border/40 group-hover:from-primary/40 group-hover:to-primary/20 transition-all duration-500" />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative bg-card rounded-2xl p-5 sm:p-6 flex flex-col gap-4 overflow-hidden"
      >
        {/* الگوی نقطه‌ای تزئینی */}
        <svg className="absolute top-0 left-0 w-32 h-32 opacity-5 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none">
          <defs>
            <pattern
              id={`dots-${feat.id}`}
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${feat.id})`} />
        </svg>

        {/* آیکون با ترفند 3D */}
        <div
          style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}
          className={cn(
            'relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3',
            feat.color
          )}
        >
          {/* درخشش زیر آیکون */}
          <div className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-current" />
          {IconComponent && <IconComponent className="h-6 w-6 relative z-10" size={24} />}
        </div>

        {/* محتوا */}
        <div
          className="flex flex-col gap-2"
          style={{ transform: 'translateZ(20px)' }}
        >
          <h3 className="text-heading-h6 font-bold text-foreground">{feat.title}</h3>
          <p className="text-body-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
        </div>

        {/* خط تزئینی پایین با انیمیشن */}
        <motion.div
          className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent origin-right"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
        />

        {/* Shine Effect روی hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.08), transparent 40%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}