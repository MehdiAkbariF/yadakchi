'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/primitives/Button/Button';
import { cn } from '@/design-system/utils/cn';
import { motion } from 'framer-motion';

interface MobileBottomActionProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  leftContent?: ReactNode;
  icon?: ReactNode;
  className?: string;
  forceShowKey?: any;
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
}: MobileBottomActionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = Math.abs(currentScrollY - lastScrollY.current);

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (diff > 5) {
        if (currentScrollY > lastScrollY.current) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, [forceShowKey]);

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : 150,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className={cn(
        "lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-zinc-100 dark:border-zinc-800/80 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4",
        className
      )}
    >
      {leftContent && (
        <div className="flex flex-col items-start text-right min-w-0">
          {leftContent}
        </div>
      )}
      <div className={cn("flex-1", leftContent ? "max-w-[60%]" : "w-full")}>
        <Button
          variant={disabled ? "outline" : "primary"}
          size="lg"
          fullWidth
          onClick={disabled ? undefined : onClick}
          isLoading={isLoading}
          disabled={disabled}
          leftIcon={icon}
          className={cn(
            "rounded-xl font-iran-yekan font-bold text-xs h-11 transition-all duration-200",
            disabled && "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 opacity-85 cursor-not-allowed hover:bg-zinc-100 hover:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          {label}
        </Button>
      </div>
    </motion.div>
  );
}