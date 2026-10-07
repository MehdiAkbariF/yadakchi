// src/domains/front/page-builder/blocks/layout/Section.tsx

import { ReactNode } from 'react';
import { cn } from '@/design-system/utils/cn';
import type { ComponentConfig } from '@measured/puck';

export interface SectionProps {
  paddingY: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background: 'none' | 'primary' | 'muted' | 'card' | 'custom';
  customBackground: string;
  rounded: boolean;
  container: boolean;
  content: ReactNode;
}

const PADDING_MAP: Record<SectionProps['paddingY'], string> = {
  none: 'py-0',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
};

const BG_MAP: Record<SectionProps['background'], string> = {
  none: '',
  primary: 'bg-primary/5',
  muted: 'bg-muted/30',
  card: 'bg-card',
  custom: '',
};

function SectionComponent(props: SectionProps) {
  const { paddingY, background, customBackground, rounded, container } = props;
  const children = props.content;

  return (
    <section
      style={
        background === 'custom' && customBackground
          ? { backgroundColor: customBackground }
          : {}
      }
      className={cn(
        PADDING_MAP[paddingY],
        BG_MAP[background],
        rounded && 'rounded-2xl',
        'my-4'
      )}
    >
      {container ? (
        <div className="max-w-6xl mx-auto px-4">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export const SectionConfig: ComponentConfig<SectionProps> = {
  label: 'بخش (Section)',
  fields: {
    paddingY: {
      type: 'select',
      label: 'فاصله عمودی',
      options: [
        { label: 'بدون فاصله', value: 'none' },
        { label: 'کم', value: 'sm' },
        { label: 'متوسط', value: 'md' },
        { label: 'زیاد', value: 'lg' },
        { label: 'خیلی زیاد', value: 'xl' },
      ],
    },
    background: {
      type: 'select',
      label: 'پس‌زمینه',
      options: [
        { label: 'بدون رنگ', value: 'none' },
        { label: 'رنگ برند', value: 'primary' },
        { label: 'خاکستری', value: 'muted' },
        { label: 'کارت', value: 'card' },
        { label: 'رنگ دلخواه', value: 'custom' },
      ],
    },
    customBackground: {
      type: 'text',
      label: 'رنگ دلخواه (hex)',
    },
    rounded: {
      type: 'radio',
      label: 'گوشه‌های گرد',
      options: [
        { label: 'بله', value: true },
        { label: 'خیر', value: false },
      ],
    },
    container: {
      type: 'radio',
      label: 'داخل Container',
      options: [
        { label: 'بله', value: true },
        { label: 'خیر', value: false },
      ],
    },
    content: {
      type: 'slot',
    },
  },
  defaultProps: {
    paddingY: 'md',
    background: 'none',
    customBackground: '',
    rounded: false,
    container: true,
  },
  render: SectionComponent,
};