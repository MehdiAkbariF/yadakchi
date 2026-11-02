'use client';

import { cn } from '@/design-system/utils/cn';
import { ThreeDotsLoader } from './ThreeDotsLoader';

interface PageLoadingProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
  show?: boolean; // اضافه شدن کنترل خروج
}

export function PageLoading({
  message,
  fullPage = false,
  className,
  show = true,
}: PageLoadingProps) {
  if (fullPage) {
    return <ThreeDotsLoader size="md" label={message} fullPage show={show} />;
  }

  // برای حالت inline اگر show=false شود، ThreeDotsLoader خودش null برمی‌گرداند
  return (
    <div
      className={cn(
        'flex w-full min-h-[300px] items-center justify-center transition-all duration-300',
        !show && 'min-h-0 h-0 overflow-hidden opacity-0',
        className
      )}
    >
      <ThreeDotsLoader size="md" label={message} show={show} />
    </div>
  );
}