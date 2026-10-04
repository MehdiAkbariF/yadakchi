'use client';

import { motion } from 'framer-motion';

interface StepCardProps {
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
      {/* خط اتصال بین مراحل (در دسکتاپ) */}
      {!isLast && (
        <svg
          className="hidden lg:block absolute top-10 -left-3 w-6 h-6 text-primary/30 z-0"
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
      )}

      <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group">
        {/* عدد مرحله با هاله */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 mb-4">
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary/30 blur-md"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
          />
          <div className="relative w-full h-full rounded-xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
            {step.number}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-extrabold text-foreground">{step.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}