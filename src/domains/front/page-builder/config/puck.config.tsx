// src/domains/front/page-builder/config/puck.config.tsx

import type { Config } from '@measured/puck';
import { HeadingConfig } from '../blocks/content/Heading';
import { TextConfig } from '../blocks/content/Text';
import { ButtonConfig } from '../blocks/content/Button';
import { ImageConfig } from '../blocks/media/Image';
import { SectionConfig } from '../blocks/layout/Section';
import { SpacerConfig } from '../blocks/layout/Spacer';
import { DividerConfig } from '../blocks/layout/Divider';

export interface PageRootProps {
  title: string;
  backgroundColor: string;
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const MAX_WIDTH_MAP: Record<PageRootProps['maxWidth'], string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

function RootComponent(props: PageRootProps & { children?: React.ReactNode }) {
  const { children, backgroundColor, maxWidth } = props;
  const safeMaxWidth = MAX_WIDTH_MAP[maxWidth] ? maxWidth : 'lg';

  return (
    <div
      style={{ backgroundColor: backgroundColor || undefined }}
      className="min-h-screen"
      dir="rtl"
    >
      <div className={`${MAX_WIDTH_MAP[safeMaxWidth]} mx-auto px-4 py-8`}>
        {children}
      </div>
    </div>
  );
}

export const puckConfig: Config = {
  root: {
    fields: {
      title: { type: 'text', label: 'عنوان صفحه' },
      backgroundColor: { type: 'text', label: 'رنگ پس‌زمینه' },
      maxWidth: {
        type: 'select',
        label: 'حداکثر عرض',
        options: [
          { label: 'کوچک', value: 'sm' },
          { label: 'متوسط', value: 'md' },
          { label: 'بزرگ', value: 'lg' },
          { label: 'خیلی بزرگ', value: 'xl' },
          { label: 'تمام عرض', value: 'full' },
        ],
      },
    },
    defaultProps: {
      title: 'صفحه',
      backgroundColor: '',
      maxWidth: 'lg',
    },
    render: RootComponent as any,
  },

  categories: {
    layout: {
      title: 'چیدمان',
      components: ['Section', 'Spacer', 'Divider'],
    },
    content: {
      title: 'محتوا',
      components: ['Heading', 'Text', 'Button'],
    },
    media: {
      title: 'رسانه',
      components: ['Image'],
    },
  },

  components: {
    Heading: HeadingConfig,
    Text: TextConfig,
    Button: ButtonConfig,
    Image: ImageConfig,
    Section: SectionConfig,
    Spacer: SpacerConfig,
    Divider: DividerConfig,
  },
};