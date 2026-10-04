'use client';

import { motion } from 'framer-motion';

interface IconProps {
  className?: string;
  size?: number;
}

// 🏪 آیکون فروشگاه - SVG اختصاصی با انیمیشن
export function StoreIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* سقف فروشگاه */}
      <motion.path
        d="M3 9L4.5 4H19.5L21 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* بدنه */}
      <motion.path
        d="M4 9V20H20V9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      />
      {/* درب */}
      <motion.rect
        x="9" y="13" width="6" height="7"
        stroke="currentColor"
        strokeWidth="1.8"
        rx="0.5"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        style={{ originY: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
      />
    </svg>
  );
}

// 📈 آیکون رشد - نمودار صعودی
export function TrendingUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* محورها */}
      <motion.path
        d="M4 20V4M4 20H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />
      {/* نمودار */}
      <motion.path
        d="M7 16L11 12L15 14L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
      />
      {/* فلش */}
      <motion.path
        d="M15 7H19V11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{ originX: 0.3, originY: 0.7 }}
        transition={{ duration: 0.4, delay: 1.1, type: 'spring' }}
      />
    </svg>
  );
}

// 📦 آیکون جعبه - با انیمیشن باز شدن درب
export function PackageIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* بدنه جعبه */}
      <motion.path
        d="M4 8L12 4L20 8V17L12 21L4 17V8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
      {/* خط وسط - درب */}
      <motion.path
        d="M4 8L12 12L20 8M12 12V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5 }}
      />
    </svg>
  );
}

// 🚚 آیکون کامیون - با چرخ‌های چرخان
export function TruckIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* کابین */}
      <motion.path
        d="M3 7H14V17H3V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ x: -10, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, type: 'spring' }}
      />
      {/* بار */}
      <motion.path
        d="M14 10H18L21 13V17H14V10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ x: -10, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15, type: 'spring' }}
      />
      {/* چرخ چپ */}
      <motion.circle
        cx="8" cy="17" r="2"
        stroke="currentColor"
        strokeWidth="1.8"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '8px', originY: '17px', transformBox: 'fill-box' }}
      />
      {/* چرخ راست */}
      <motion.circle
        cx="17" cy="17" r="2"
        stroke="currentColor"
        strokeWidth="1.8"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '17px', originY: '17px', transformBox: 'fill-box' }}
      />
    </svg>
  );
}

// ✨ آیکون درخشش - ستاره‌های پویا
export function SparklesIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <motion.path
        d="M12 3L13.5 9L19 10.5L13.5 12L12 18L10.5 12L5 10.5L10.5 9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, type: 'spring' }}
        style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
      />
      <motion.path
        d="M19 4L19.7 6.3L22 7L19.7 7.7L19 10L18.3 7.7L16 7L18.3 6.3L19 4Z"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
        style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
      />
      <motion.path
        d="M6 15L6.5 16.5L8 17L6.5 17.5L6 19L5.5 17.5L4 17L5.5 16.5L6 15Z"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6, type: 'spring' }}
        style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
      />
    </svg>
  );
}

// 👥 آیکون شبکه - نودهای متصل
export function NetworkIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* خطوط اتصال */}
      <motion.path
        d="M12 6V10M6 14L10 12M18 14L14 12M6 18L10 14M18 18L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      {/* نود مرکزی */}
      <motion.circle
        cx="12" cy="6" r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, type: 'spring' }}
        style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
      />
      {/* نودهای اطراف */}
      {[
        { cx: 6, cy: 14, delay: 0.5 },
        { cx: 18, cy: 14, delay: 0.6 },
        { cx: 6, cy: 18, delay: 0.7 },
        { cx: 18, cy: 18, delay: 0.8 },
      ].map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.cx} cy={pos.cy} r="2"
          stroke="currentColor"
          strokeWidth="1.8"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: pos.delay, type: 'spring' }}
          style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
        />
      ))}
    </svg>
  );
}

// 🎯 مپ کردن id به کامپوننت
export const FeatureIconMap = {
  panel: StoreIcon,
  accounting: TrendingUpIcon,
  inventory: PackageIcon,
  shipping: TruckIcon,
  ads: SparklesIcon,
  b2b: NetworkIcon,
} as const;