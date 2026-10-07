// src/domains/front/page-builder/blocks/layout/Spacer.tsx

import type { ComponentConfig } from '@measured/puck';

export interface SpacerProps {
  height: number;
}

function SpacerComponent({ height = 32 }: SpacerProps) {
  return <div style={{ height: `${height}px` }} aria-hidden="true" />;
}

export const SpacerConfig: ComponentConfig<SpacerProps> = {
  label: 'فاصله (Spacer)',
  fields: {
    height: {
      type: 'number',
      label: 'ارتفاع (پیکسل)',
      min: 4,
      max: 400,
    },
  },
  defaultProps: {
    height: 32,
  },
  render: SpacerComponent,
};