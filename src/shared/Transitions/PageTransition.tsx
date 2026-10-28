// src/shared/Transitions/PageTransition.tsx
'use client';

import { motion } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ 
        duration: 0.18, 
        ease: [0.22, 1, 0.36, 1] // کیوبیک بیزیر استاندارد اپ‌های نیتیو iOS/Android
      }}
      className="w-full transform-gpu will-change-[opacity,transform]"
    >
      {children}
    </motion.div>
  );
}