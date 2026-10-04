'use client';

import { motion } from 'framer-motion';

interface MarqueeLogosProps {
  logos: { id: string; name: string; icon: string }[];
  speed?: number;
}

export function MarqueeLogos({ logos, speed = 40 }: MarqueeLogosProps) {
  // لوگوها رو دو بار تکرار می‌کنیم برای loop بی‌نهایت
  const doubledLogos = [...logos, ...logos, ...logos];

  return (
    <div className="relative w-full overflow-hidden mask-fade-x py-lg">
      <motion.div
        className="flex gap-xl items-center"
        animate={{ x: '-33.33%' }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ width: 'max-content' }}
      >
        {doubledLogos.map((logo, i) => (
          <div
            key={`${logo.id}-${i}`}
            className="shrink-0 w-24 h-16 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
          >
            <img
              src={logo.icon}
              alt={logo.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}