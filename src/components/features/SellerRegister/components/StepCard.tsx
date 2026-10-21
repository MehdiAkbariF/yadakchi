'use client';

import { motion } from 'framer-motion';

export interface StepCardProps {
  step: {
    number: string;
    title: string;
    desc: string;
  };
  index: number;
  isLast: boolean;
}

export function StepCard({ step, index, isLast }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      className="relative"
    >
      {!isLast ? (
        <svg
          aria-hidden="true"
          className="absolute -start-3 top-10 z-0 hidden h-6 w-6 text-primary/30 lg:block"
          viewBox="0 0 24 24"
          fill="none"
        >
          <motion.path
            d="M24 12L0 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
          />
        </svg>
      ) : null}

      <div className="group relative rounded-lg border border-border bg-gradient-to-br from-card to-muted/30 p-5 transition-all duration-normal hover:border-primary/40 hover:shadow-md sm:p-6">
        <div className="relative mb-4 h-12 w-12">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-md bg-primary/30 blur-md"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
          />
          <div className="relative flex h-full w-full items-center justify-center rounded-md bg-primary text-lg font-bold text-primary-foreground shadow-md transition-transform duration-normal group-hover:scale-110">
            {step.number}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}