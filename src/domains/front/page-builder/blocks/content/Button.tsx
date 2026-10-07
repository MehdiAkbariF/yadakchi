// src/domains/front/page-builder/blocks/content/Button.tsx

import { cn } from '@/design-system/utils/cn';
import type { ComponentConfig } from '@measured/puck';

export interface ButtonProps {
  label: string;
  href: string;
  variant: 'primary' | 'outline' | 'ghost';
  align: 'right' | 'center' | 'left';
  size: 'sm' | 'md' | 'lg';
}

const VARIANT_MAP: Record<ButtonProps['variant'], string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-input bg-background hover:bg-accent',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
};

const SIZE_MAP: Record<ButtonProps['size'], string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const ALIGN_MAP: Record<ButtonProps['align'], string> = {
  right: 'justify-start',
  center: 'justify-center',
  left: 'justify-end',
};

function ButtonComponent(props: ButtonProps) {
  const { label, href, variant, align, size } = props;

  return (
    <div className={cn('flex w-full my-3', ALIGN_MAP[align])}>
      <a
        href={href || '#'}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors font-iran-yekan',
          VARIANT_MAP[variant],
          SIZE_MAP[size]
        )}
      >
        {label || 'دکمه'}
      </a>
    </div>
  );
}

export const ButtonConfig: ComponentConfig<ButtonProps> = {
  label: 'دکمه (Button)',
  fields: {
    label: { type: 'text', label: 'متن دکمه' },
    href: { type: 'text', label: 'لینک (URL)' },
    variant: {
      type: 'radio',
      label: 'نوع دکمه',
      options: [
        { label: 'اصلی', value: 'primary' },
        { label: 'دورخط', value: 'outline' },
        { label: 'شبح', value: 'ghost' },
      ],
    },
    size: {
      type: 'select',
      label: 'اندازه',
      options: [
        { label: 'کوچک', value: 'sm' },
        { label: 'متوسط', value: 'md' },
        { label: 'بزرگ', value: 'lg' },
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
  },
  defaultProps: {
    label: 'دکمه جدید',
    href: '#',
    variant: 'primary',
    size: 'md',
    align: 'center',
  },
  render: ButtonComponent,
};