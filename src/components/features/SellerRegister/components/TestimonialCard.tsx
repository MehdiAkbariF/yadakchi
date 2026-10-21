'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export interface TestimonialCardProps {
  testimonial: {
    initial: string;
    name: string;
    shop: string;
    quote: string;
  };
  index: number;
}

export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-primary/0 via-primary/20 to-primary/0 opacity-0 blur-lg transition-opacity duration-slow group-hover:opacity-100" />

      <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-border bg-card p-5 sm:p-6">
        <svg
          aria-hidden="true"
          className="absolute -left-2 -top-2 h-20 w-20 text-primary/5 transition-colors duration-slow group-hover:text-primary/10"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9.5 4C6.5 4 4 6.5 4 9.5V20H14V9.5C14 6.5 11.5 4 9.5 4Z" opacity="0.5" />
          <path d="M19.5 4C16.5 4 14 6.5 14 9.5V20H24V9.5C24 6.5 21.5 4 19.5 4Z" opacity="0.3" />
        </svg>

        <div className="relative flex flex-1 flex-col gap-4">
          <Quote aria-hidden="true" className="h-6 w-6 rotate-180 text-primary/60" />
          <p className="relative z-10 text-sm leading-reading text-foreground/90">{testimonial.quote}</p>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
          <div className="relative">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-accent text-sm font-bold text-primary">
              {testimonial.initial}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{testimonial.name}</span>
            <span className="mt-0.5 text-2xs text-muted-foreground">{testimonial.shop}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}