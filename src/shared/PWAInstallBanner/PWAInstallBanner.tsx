'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare, Info, MoreVertical, Monitor } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';

export function PWAInstallBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const dismissedAt = localStorage.getItem('pwa_install_dismissed_at');
    if (dismissedAt) {
      const daysDiff = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysDiff < 14) return; 
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|optios|edgios/.test(userAgent);

    if (isIphoneOrIpad && isSafari) {
      setIsIOS(true);
    }

    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 2000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) return;

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast.success('وب‌اپلیکیشن یدک‌چی با موفقیت نصب شد');
          setShowBanner(false);
        }
      } catch (error) {
        console.error('[PWAInstall] Native install failed:', error);
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      setIsGuideOpen(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed_at', Date.now().toString());
    setShowBanner(false);
  };

  if (!isMounted || !showBanner) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          style={{
            bottom: typeof window !== 'undefined' && window.innerWidth < 1024 
              ? 'calc(84px + env(safe-area-inset-bottom))' 
              : '1.25rem'
          }}
          className={cn(
            "fixed left-4 right-4 z-[100] bg-card border border-border/85 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-md mx-auto text-right select-none"
          )}
          dir="rtl"
        >
          <div className="flex items-start gap-3 w-full">
            <div className="w-10 h-10 rounded-xl border bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-inner p-1.5">
              <img src="/Logo.svg" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black text-foreground font-iran-sans">نصب وب‌اپلیکیشن یدک‌چی</span>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-muted text-muted-foreground/80 hover:text-foreground rounded-full transition-colors outline-none shrink-0"
                  aria-label="بستن بنر"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isIOS ? (
                <p className="text-[10px] md:text-[11px] leading-relaxed text-muted-foreground font-iran-sans mt-1">
                  برای نصب، در نوار پایین سافاری دکمه اشتراک‌گذاری <Share className="h-3 w-3 inline text-primary mx-0.5" /> را زده و سپس گزینه <PlusSquare className="h-3.5 w-3.5 inline text-primary mx-0.5" /> **Add to Home Screen** را انتخاب کنید.
                </p>
              ) : (
                <p className="text-[10px] md:text-[11px] leading-relaxed text-muted-foreground font-iran-sans mt-1">
                  با نصب اپلیکیشن، یدک‌چی را همیشه سریع‌تر، سبک‌تر و بدون نیاز به مرورگر در دسترس داشته باشید.
                </p>
              )}
            </div>
          </div>

          {!isIOS && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="rounded-xl font-iran-sans font-bold text-xs h-9 px-4 shrink-0 shadow-sm flex items-center justify-center gap-1.5 w-full md:w-auto"
            >
              <Download className="h-3.5 w-3.5" />
              <span>نصب سریع اپلیکیشن</span>
            </Button>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} className="max-w-sm w-full animate-none">
        <ModalHeader onClose={() => setIsGuideOpen(false)}>
          <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-1.5">
            <Info className="h-4.5 w-4.5 text-primary" />
            راهنمای نصب دستی اپلیکیشن
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-5 pt-4 text-right flex flex-col gap-4">
          <p className="text-xs leading-relaxed text-muted-foreground font-iran-sans">
            مرورگر شما هنوز برای نصب اتوماتیک آماده نیست. شما می‌توانید به راحتی و به صورت دستی اپلیکیشن را روی گوشی یا کامپیوتر خود نصب کنید:
          </p>
          
          <div className="flex flex-col gap-3.5 border-t border-dashed pt-4">
            <div className="flex items-start gap-2.5 text-xs text-foreground font-iran-sans">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">۱</span>
              <p className="leading-relaxed">
                در بالای صفحه مرورگر، دکمه سه نقطه <MoreVertical className="h-4 w-4 inline text-zinc-400 mx-0.5" /> (یا دکمه نصب مانیتور شکل <Monitor className="h-4 w-4 inline text-zinc-400 mx-0.5" /> در کادر آدرس سیستم) را کلیک کنید.
              </p>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-foreground font-iran-sans">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">۲</span>
              <p className="leading-relaxed">
                از منوی باز شده، گزینه **Install** یا **Add to Home screen** (افزودن به صفحه اصلی) را انتخاب کنید.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsGuideOpen(false)}
            className="rounded-xl mt-4 text-xs h-10 font-bold font-iran-sans"
          >
            متوجه شدم
          </Button>
        </ModalBody>
      </Modal>
    </>
  );
}