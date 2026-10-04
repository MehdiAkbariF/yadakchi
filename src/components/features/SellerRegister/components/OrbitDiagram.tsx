'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
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
    color: 'text-primary bg-primary/10',
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
  const [notifications] = useState<Notification[]>([
    { id: 1, text: 'علی علوی ۱ خرید انجام داد', type: 'buy' },
    { id: 2, text: 'فروشگاه آزادی: ثبت محصول جدید', type: 'add' },
    { id: 3, text: 'تامین‌کننده البرز: تایید سفارش', type: 'approve' },
  ]);
  const [notifIndex, setNotifIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  return (
    <div className="lg:col-span-6 w-full flex items-center justify-center relative order-2 py-10 sm:py-16">
      <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[460px] md:h-[460px] flex items-center justify-center">
        
        {/* حلقه‌های چرخان SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 400"
          fill="none"
        >
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F56D3C" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F56D3C" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* حلقه بیرونی */}
          <motion.circle
            cx="200" cy="200" r="190"
            stroke="url(#ringGrad)"
            strokeWidth="1"
            strokeDasharray="6 12"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
          />

          {/* حلقه میانی */}
          <motion.circle
            cx="200" cy="200" r="155"
            stroke="#F56D3C"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            strokeDasharray="3 8"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
          />

          {/* حلقه داخلی */}
          <motion.circle
            cx="200" cy="200" r="115"
            stroke="#F56D3C"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            animate={{ 
              r: [115, 120, 115],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '50%', originY: '50%', transformBox: 'fill-box' }}
          />
        </svg>

        {/* نودهای اطراف که می‌چرخند */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-full h-full rounded-full pointer-events-none"
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
                  {/* glow پشت نود */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                  />
                  
                  <div className="relative bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl p-3 shadow-2xl flex items-center gap-2.5 whitespace-nowrap hover:scale-110 hover:border-primary/60 transition-all duration-300 cursor-default">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', item.color)}>
                      <ItemIcon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-black text-foreground">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* لوگوی مرکزی با pulse */}
        <div className="relative z-10">
          {/* هاله‌های متعدد پشت لوگو */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />

          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-background border-2 border-primary/20 shadow-2xl p-4 flex items-center justify-center backdrop-blur-sm">
            <img src="/Logo.svg" alt="یدک‌چی" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* کارت نوتیفیکیشن زنده */}
        <div className="absolute -bottom-6 sm:bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[280px] z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={notifIndex}
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-3 shadow-xl flex items-center gap-3"
            >
              <motion.div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  notifications[notifIndex].type === 'buy' && 'bg-primary/10 text-primary',
                  notifications[notifIndex].type === 'add' && 'bg-blue-500/10 text-blue-500',
                  notifications[notifIndex].type === 'approve' && 'bg-emerald-500/10 text-emerald-500'
                )}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {notifications[notifIndex].type === 'buy' && <Check className="h-4 w-4 stroke-[2.5]" />}
                {notifications[notifIndex].type === 'add' && <Plus className="h-4 w-4 stroke-[2.5]" />}
                {notifications[notifIndex].type === 'approve' && <ShieldCheck className="h-4 w-4 stroke-[2.5]" />}
              </motion.div>
              <div className="flex-1 min-w-0 text-right">
                <span className="text-[11px] sm:text-xs font-black text-foreground block truncate">
                  {notifications[notifIndex].text}
                </span>
                <span className="text-[9px] text-muted-foreground block flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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