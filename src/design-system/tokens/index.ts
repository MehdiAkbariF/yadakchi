// src/design-system/tokens/index.ts

// ─── رنگ‌ها ───
export {
  primitive,
  semantic,
  domain,
  colors,
} from './colors';
export type {
  PrimitiveColors,
  SemanticColors,
  DomainColors,
} from './colors';

// ─── تایپوگرافی ───
export {
  typography,
  fontFamily,
  fontWeight,
  typographyTokens,
  legacyTypography,
} from './typography';
export type { TypographyTokens } from './typography';

// ─── فاصله‌ها ───
export {
  space,
  radii,
  sizes,
  spacingTokens,
  spacing,
} from './spacing';
export type { SpacingTokens } from './spacing';

// ─── سایه‌ها ───
export {
  shadows,
  coloredShadows,
  focusRings,
  dropShadows,
  elevationTokens,
} from './shadows';
export type { ElevationTokens } from './shadows';

// ─── انیمیشن ───
export {
  motionTokens,
  duration,
  easing,
  spring,
  distance,
  presets,
} from './motion';
export type { MotionTokens } from './motion';

// ─── بریک‌پوینت‌ها ───
export * from './breakpoints';