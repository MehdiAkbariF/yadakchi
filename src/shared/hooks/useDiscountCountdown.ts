// src/shared/hooks/useDiscountCountdown.ts
'use client';

import * as React from 'react';
import { useGetCurrentTime } from '@/domains/front/static/hooks/static.hooks';
import { toPersianDigits } from '@/core/utils/formatters';

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formattedPersian: {
    hours: string;
    minutes: string;
    seconds: string;
  };
}

export function useDiscountCountdown(expirationDate?: string | Date | null): CountdownResult {
  const { data: serverTimeRaw } = useGetCurrentTime();
  const serverOffsetRef = React.useRef<number>(0);

  // محاسبه اختلاف ساعت کلاینت با ساعت سرور
  React.useEffect(() => {
    if (serverTimeRaw) {
      try {
        const serverMs =
          serverTimeRaw instanceof Date
            ? serverTimeRaw.getTime()
            : new Date(serverTimeRaw as unknown as string).getTime();

        if (!isNaN(serverMs)) {
          serverOffsetRef.current = serverMs - Date.now();
        }
      } catch {
        serverOffsetRef.current = 0;
      }
    }
  }, [serverTimeRaw]);

  const [timeLeft, setTimeLeft] = React.useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
  });

  React.useEffect(() => {
    if (!expirationDate) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const targetMs =
      expirationDate instanceof Date
        ? expirationDate.getTime()
        : new Date(expirationDate).getTime();

    if (isNaN(targetMs)) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    const calculate = () => {
      const currentSyncedTime = Date.now() + serverOffsetRef.current;
      const diff = targetMs - currentSyncedTime;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return false;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isExpired: false,
      });
      return true;
    };

    const isValid = calculate();
    if (!isValid) return;

    const interval = setInterval(() => {
      const continues = calculate();
      if (!continues) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationDate]);

  const padZero = (n: number) => String(n).padStart(2, '0');

  return {
    ...timeLeft,
    formattedPersian: {
      hours: toPersianDigits(padZero(timeLeft.hours)),
      minutes: toPersianDigits(padZero(timeLeft.minutes)),
      seconds: toPersianDigits(padZero(timeLeft.seconds)),
    },
  };
}