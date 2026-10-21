'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/design-system/utils/cn';

export interface MobileBottomActionProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  leftContent?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  forceShowKey?: unknown;
  variant?: 'default' | 'notify';
}

export function MobileBottomAction({
  label,
  onClick,
  isLoading,
  disabled,
  leftContent,
  icon,
  className,
  forceShowKey,
  variant = 'default',
}: MobileBottomActionProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = Math.abs(currentScrollY - lastScrollY.current);

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (diff > 5) {
        setIsVisible(currentScrollY <= lastScrollY.current);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    setIsVisible(true);
  }, [forceShowKey]);

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: isVisible ? 0 : 150, opacity: isVisible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className={cn(
        'lg:hidden fixed bottom-16 inset-x-0 z-fixed bg-card border-t border-border px-4 py-3 shadow-sm',
        'flex items-center justify-between gap-4',
        className
      )}
    >
      {leftContent ? (
        <div className="flex min-w-0 flex-col items-start text-start">{leftContent}</div>
      ) : null}
      <div className={cn('flex-1', leftContent ? 'max-w-[60%]' : 'w-full')}>
        <Button
          variant={variant === 'notify' ? 'destructive' : disabled ? 'outline' : 'primary'}
          size="lg"
          fullWidth
          onClick={onClick}
          isLoading={isLoading}
          disabled={variant === 'notify' ? false : disabled}
          leftIcon={icon}
          className="h-11 rounded-md text-sm font-semibold"
        >
          {label}
        </Button>
      </div>
    </motion.div>
  );
}
