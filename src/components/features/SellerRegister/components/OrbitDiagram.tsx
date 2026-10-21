'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, User, Layers, Plus, Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface Notification {
  id: number;
  text: string;
  type: 'buy' | 'add' | 'approve';
}

const orbitItems = [
  {
    id: 'buyer',
    title: 'خریدار آنلاین',
    desc: 'در جستجوی قطعه',
    icon: User,
    color: 'text-primary bg-accent',
    top: '0%',
    left: '50%',
  },
  {
    id: 'store',
    title: 'فروشگاه شما',
    desc: 'ثبت موجودی آسان',
    icon: Store,
    color: 'text-emerald-500 bg-emerald-500/10',
    top: '75%',
    left: '93.3%',
  },
  {
    id: 'supplier',
    title: 'تأمین‌کننده',
    desc: 'فروش بی‌واسطه',
    icon: Layers,
    color: 'text-blue-500 bg-blue-500/10',
    top: '75%',
    left: '6.7%',
  },
];

export function OrbitDiagram() {
  const [notifications] = React.useState<Notification[]>([
    { id: 1, text: 'علی علوی ۱ خرید انجام داد', type: 'buy' },
    { id: 2, text: 'فروشگاه آزادی: ثبت محصول جدید', type: 'add' },
    { id: 3, text: 'تامین‌کننده البرز: تایید سفارش', type: 'approve' },
  ]);
  const [notifIndex, setNotifIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  return (
    <div className="relative order-2 flex w-full items-center justify-center py-10 sm:py-16 lg:col-span-6">
      <div className="relative flex h-[280px] w-[280px] items-center justify-center sm:h-[380px] sm:w-[380px] md:h-[460px] md:w-[460px]">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 400"
          fill="none"
        >
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D95D32" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D95D32" stopOpacity="0" />
            </linearGradient>
          </defs>

          <motion.circle
            cx="200"
            cy="200"
            r="190"
            stroke="url(#ringGrad)"
            strokeWidth="1"
            strokeDasharray="6 12"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
          />

          <motion.circle
            cx="200"
            cy="200"
            r="155"
            stroke="#D95D32"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            strokeDasharray="3 8"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
          />

          <motion.circle
            cx="200"
            cy="200"
            r="115"
            stroke="#D95D32"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            animate={{ r: [115, 120, 115], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
          />
        </svg>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute inset-0 h-full w-full rounded-full"
        >
          {orbitItems.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: item.top,
                  left: item.left,
                  transform: 'translate(-50%, -50%)',
                }}
                className="pointer-events-auto"
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                >
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg bg-primary/20 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                  />

                  <div className="relative flex cursor-default items-center gap-2.5 whitespace-nowrap rounded-lg border border-primary/30 bg-card/95 p-3 shadow-md backdrop-blur-xl transition-colors duration-normal hover:border-primary/60">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                        item.color
                      )}
                    >
                      <ItemIcon aria-hidden="true" className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{item.title}</span>
                      <span className="mt-0.5 text-2xs text-muted-foreground">{item.desc}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        <div className="relative z-10">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />

          <div className="relative flex h-24 w-24 items-center justify-center rounded-lg border-2 border-primary/20 bg-card p-4 shadow-lg backdrop-blur-sm sm:h-32 sm:w-32">
            <img src="/Logo.svg" alt="یدک‌چی" className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="absolute -bottom-6 left-1/2 z-20 w-[calc(100%-2rem)] max-w-[280px] -translate-x-1/2 sm:bottom-0 rtl:translate-x-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={notifIndex}
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex w-full items-center gap-3 rounded-lg border border-primary/20 bg-card/95 p-3 shadow-lg backdrop-blur-xl"
            >
              <motion.div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                  notifications[notifIndex].type === 'buy' && 'bg-accent text-primary',
                  notifications[notifIndex].type === 'add' && 'bg-blue-500/10 text-blue-500',
                  notifications[notifIndex].type === 'approve' &&
                    'bg-emerald-500/10 text-emerald-500'
                )}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {notifications[notifIndex].type === 'buy' ? (
                  <Check aria-hidden="true" className="h-4 w-4 stroke-2" />
                ) : null}
                {notifications[notifIndex].type === 'add' ? (
                  <Plus aria-hidden="true" className="h-4 w-4 stroke-2" />
                ) : null}
                {notifications[notifIndex].type === 'approve' ? (
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 stroke-2" />
                ) : null}
              </motion.div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-foreground">
                  {notifications[notifIndex].text}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-2xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  به صورت زنده در یدک‌چی
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
