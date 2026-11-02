'use client';

import { cn } from '@/design-system/utils/cn';
import { ThreeDotsLoader } from './ThreeDotsLoader';

interface PageLoadingProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
}

export function PageLoading({
  message,
  fullPage = false,
  className,
}: PageLoadingProps) {
  if (fullPage) {
    return <ThreeDotsLoader size="md" label={message} fullPage />;
  }

  return (
    <div
      className={cn(
        'flex w-full min-h-[300px] items-center justify-center',
        className
      )}
    >
      <ThreeDotsLoader size="md" label={message} />
    </div>
  );
}