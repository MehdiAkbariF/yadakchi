// src/domains/front/page-builder/blocks/content/Heading.tsx

import { cn } from '@/design-system/utils/cn';  // ← مسیر فرانت
import type { ComponentConfig } from '@measured/puck';

export interface HeadingProps {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  align: 'right' | 'center' | 'left';
  color: string;
}

const SIZE_MAP: Record<HeadingProps['level'], string> = {
  h1: 'text-3xl md:text-4xl lg:text-5xl font-black',
  h2: 'text-2xl md:text-3xl lg:text-4xl font-black',
  h3: 'text-xl md:text-2xl lg:text-3xl font-extrabold',
  h4: 'text-lg md:text-xl lg:text-2xl font-bold',
  h5: 'text-base md:text-lg lg:text-xl font-bold',
  h6: 'text-sm md:text-base lg:text-lg font-bold',
};

const ALIGN_MAP: Record<HeadingProps['align'], string> = {
  right: 'text-right',
  center: 'text-center',
  left: 'text-left',
};

function HeadingComponent(props: HeadingProps) {
  const { text, level, align, color } = props;
  const Tag = level;

  return (
    <Tag
      style={{ color: color || undefined }}
      className={cn(
        SIZE_MAP[level],
        ALIGN_MAP[align],
        'leading-tight my-3 font-iran-yekan'
      )}
    >
      {text || 'عنوان خود را وارد کنید'}
    </Tag>
  );
}

export const HeadingConfig: ComponentConfig<HeadingProps> = {
  label: 'عنوان (Heading)',
  fields: {
    text: { type: 'textarea', label: 'متن عنوان' },
    level: {
      type: 'select',
      label: 'سطح تیتر',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' },
        { label: 'H6', value: 'h6' },
      ],
    },
    align: {
      type: 'radio',
      label: 'چینش',
      options: [
        { label: 'راست', value: 'right' },
        { label: 'وسط', value: 'center' },
        { label: 'چپ', value: 'left' },
      ],
    },
    color: { type: 'text', label: 'رنگ (hex, اختیاری)' },
  },
  defaultProps: {
    text: 'عنوان جدید',
    level: 'h2',
    align: 'right',
    color: '',
  },
  render: HeadingComponent,
};