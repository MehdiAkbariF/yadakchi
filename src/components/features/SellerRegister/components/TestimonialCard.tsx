'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
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
      {/* Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/0 via-primary/20 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500" />

      <div className="relative bg-card border border-border/60 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 h-full overflow-hidden">
        {/* آیکون نقل قول بزرگ تزئینی */}
        <svg className="absolute -top-2 -left-2 w-20 h-20 text-primary/5 group-hover:text-primary/10 transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5 4C6.5 4 4 6.5 4 9.5V20H14V9.5C14 6.5 11.5 4 9.5 4Z" opacity="0.5" />
          <path d="M19.5 4C16.5 4 14 6.5 14 9.5V20H24V9.5C24 6.5 21.5 4 19.5 4Z" opacity="0.3" />
        </svg>

        <div className="relative flex flex-col gap-4 flex-1">
          <Quote className="w-6 h-6 text-primary/60 rotate-180" />
          <p className="text-xs sm:text-sm text-foreground/90 leading-loose relative z-10">
            {testimonial.quote}
          </p>
        </div>

        <div className="flex items-center gap-3 border-t border-border/40 pt-4 mt-auto">
          <div className="relative">
            {/* حلقه pulse دور حرف اول */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 text-primary font-black text-sm flex items-center justify-center">
              {testimonial.initial}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{testimonial.name}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{testimonial.shop}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}