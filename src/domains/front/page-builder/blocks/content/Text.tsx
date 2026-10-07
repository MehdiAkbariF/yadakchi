// src/domains/front/page-builder/blocks/content/Text.tsx

import { cn } from '@/design-system/utils/cn';
import type { ComponentConfig } from '@measured/puck';

export interface TextProps {
  content: string;
  align: 'right' | 'center' | 'left' | 'justify';
  size: 'sm' | 'base' | 'lg';
  color: string;
}

const SIZE_MAP: Record<TextProps['size'], string> = {
  sm: 'text-xs md:text-sm',
  base: 'text-sm md:text-base',
  lg: 'text-base md:text-lg',
};

const ALIGN_MAP: Record<TextProps['align'], string> = {
  right: 'text-right',
  center: 'text-center',
  left: 'text-left',
  justify: 'text-justify',
};

function TextComponent(props: TextProps) {
  const { content, align, color, size } = props;

  return (
    <p
      style={{ color: color || undefined }}
      className={cn(
        SIZE_MAP[size],
        ALIGN_MAP[align],
        'leading-loose text-foreground/90 font-iran-yekan my-2 whitespace-pre-wrap'
      )}
    >
      {content || 'متن خود را وارد کنید'}
    </p>
  );
}

export const TextConfig: ComponentConfig<TextProps> = {
  label: 'متن (Text)',
  fields: {
    content: { type: 'textarea', label: 'محتوای متن' },
    align: {
      type: 'radio',
      label: 'چینش',
      options: [
        { label: 'راست', value: 'right' },
        { label: 'وسط', value: 'center' },
        { label: 'چپ', value: 'left' },
        { label: 'هم‌تراز', value: 'justify' },
      ],
    },
    size: {
      type: 'select',
      label: 'اندازه',
      options: [
        { label: 'کوچک', value: 'sm' },
        { label: 'متوسط', value: 'base' },
        { label: 'بزرگ', value: 'lg' },
      ],
    },
    color: { type: 'text', label: 'رنگ (hex, اختیاری)' },
  },
  defaultProps: {
    content: 'متن جدید خود را اینجا بنویسید...',
    align: 'right',
    size: 'base',
    color: '',
  },
  render: TextComponent,
};