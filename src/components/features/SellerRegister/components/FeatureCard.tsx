'use client';

import { motion } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { FeatureIconMap } from '../svgs/FeatureIcons';

export interface FeatureCardProps {
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
      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 blur-lg transition-opacity duration-slow group-hover:opacity-100" />
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-border to-border/60 transition-colors duration-slow group-hover:from-primary/30 group-hover:to-primary/10" />

      <div className="relative flex flex-col gap-4 overflow-hidden rounded-lg bg-card p-5 sm:p-6">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-32 w-32 opacity-5 transition-opacity duration-slow group-hover:opacity-10"
        >
          <defs>
            <pattern id={`dots-${feat.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${feat.id})`} />
        </svg>

        <div
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-md transition-transform duration-slow group-hover:scale-110 group-hover:rotate-3',
            feat.color
          )}
        >
          {IconComponent ? <IconComponent className="h-6 w-6" size={24} /> : null}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-foreground">{feat.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{feat.desc}</p>
        </div>

        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 start-0 end-0 h-0.5 origin-right bg-gradient-to-l from-transparent via-primary/50 to-primary"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}