export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
  md: '0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
  lg: '0 12px 24px -6px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.05)',
} as const;

export type ShadowKey = keyof typeof shadows;