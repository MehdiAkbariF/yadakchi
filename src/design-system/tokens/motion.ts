export const duration = {
  fast:   '150ms',
  normal: '200ms',
  slow:   '300ms',
} as const;

export const easing = {
  out:   'cubic-bezier(0.16, 1, 0.3, 1)',
  in:    'cubic-bezier(0.4, 0, 1, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const transition = {
  colors:    'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  all:       'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;