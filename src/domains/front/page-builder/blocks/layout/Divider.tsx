// src/domains/front/page-builder/blocks/layout/Divider.tsx

import type { ComponentConfig } from '@measured/puck';

export interface DividerProps {
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  thickness: number;
  spacing: number;
}

function DividerComponent(props: DividerProps) {
  const { style, color, thickness, spacing } = props;

  return (
    <div
      style={{
        marginTop: `${spacing}px`,
        marginBottom: `${spacing}px`,
      }}
      aria-hidden="true"
    >
      <hr
        style={{
          borderStyle: style,
          borderColor: color || undefined,
          borderTopWidth: `${thickness}px`,
        }}
      />
    </div>
  );
}

export const DividerConfig: ComponentConfig<DividerProps> = {
  label: 'جداکننده (Divider)',
  fields: {
    style: {
      type: 'radio',
      label: 'سبک',
      options: [
        { label: 'خط ساده', value: 'solid' },
        { label: 'خط تیره', value: 'dashed' },
        { label: 'خط نقطه‌ای', value: 'dotted' },
      ],
    },
    color: { type: 'text', label: 'رنگ (hex, اختیاری)' },
    thickness: {
      type: 'number',
      label: 'ضخامت (پیکسل)',
      min: 1,
      max: 10,
    },
    spacing: {
      type: 'number',
      label: 'فاصله بالا/پایین',
      min: 0,
      max: 100,
    },
  },
  defaultProps: {
    style: 'solid',
    color: '',
    thickness: 1,
    spacing: 16,
  },
  render: DividerComponent,
};