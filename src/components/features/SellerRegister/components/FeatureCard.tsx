'use client';

import { motion } from 'framer-motion';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      {/* Glow پشت کارت */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500" />
      
      {/* Border گرادیانت */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-border/80 to-border/40 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500" />
      
      <div className="relative bg-card rounded-2xl p-5 sm:p-6 flex flex-col gap-4 overflow-hidden">
        {/* الگوی نقطه‌ای تزئینی */}
        <svg className="absolute top-0 left-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
          <defs>
            <pattern id={`dots-${feat.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${feat.id})`} />
        </svg>

        <div className={cn(
          'relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
          feat.color
        )}>
          {IconComponent && <IconComponent className="h-6 w-6" size={24} />}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm sm:text-base font-extrabold text-foreground">{feat.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
        </div>

        {/* خط تزئینی پایین */}
        <motion.div
          className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent origin-right"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}