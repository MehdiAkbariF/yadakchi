'use client';

import { motion } from 'framer-motion';

// 🌟 گرید متحرک پس‌زمینه
export function AnimatedGrid({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
        <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="gridMask">
          <rect width="100%" height="100%" fill="url(#gridFade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#grid)"
        mask="url(#gridMask)"
        className="text-primary/20"
      />
    </svg>
  );
}

// 🌊 موج SVG متحرک
export function AnimatedWaves({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`absolute bottom-0 left-0 w-full pointer-events-none ${className}`}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F56D3C" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F56D3C" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#F56D3C" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        fill="url(#waveGrad)"
        animate={{
          d: [
            "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </svg>
  );
}

// 🔵 حلقه چرخان تزئینی
export function RotatingRings({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <motion.circle
        cx="200" cy="200" r="180"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="4 8"
        className="text-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
      />
      <motion.circle
        cx="200" cy="200" r="140"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="2 6"
        className="text-primary/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
      />
      <motion.circle
        cx="200" cy="200" r="100"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-primary/15"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
      />
    </svg>
  );
}