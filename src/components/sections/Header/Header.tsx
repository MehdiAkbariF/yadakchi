// src/components/sections/Header/Header.tsx

'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/design-system/utils/cn';
import { Logo } from './components/Logo/Logo';
import { SearchBar } from './components/SearchBar/SearchBar';
import { SellerButton } from './components/SellerButton/SellerButton';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { AuthButton } from './components/AuthButton/AuthButton';
import { CartButton } from './components/CartButton/CartButton';
import { DesktopNavigation } from './components/DesktopNavigation/DesktopNavigation';
import { MobileHeader } from './components/MobileHeader/MobileHeader';
import { MyCarButton } from './components/MyCarButton/MyCarButton';
import { CitySelector } from './components/CitySelector/CitySelector';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  useAuth(); 
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);

  // هوک اسکرول فریمور موشن
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // زمانی که کاربر بیش از ۱۲۰ پیکسل اسکرول کند، ظاهر هدر جمع می‌شود
    if (latest > 120) {
      setIsHeaderMinimized(true);
    } else {
      setIsHeaderMinimized(false);
    }
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    // در دسکتاپ پس‌زمینه شفاف است تا فضای خالی اشغال‌شده هدر تداخلی با محتوای زیرین نداشته باشد
    <header className={cn('sticky top-0 z-50 w-full bg-background border-b lg:bg-transparent lg:border-b-0 transition-colors duration-300', className)}>
      
      {/* ===== دسکتاپ (lg و بالاتر) ===== */}
      {/* این بخش ارتفاع ثابت ۱۱۶ پیکسلی دارد تا هیچ تغییر ارتفاعی به بدنه صفحه منتقل نشود */}
      <div className="hidden lg:block h-[116px] w-full pointer-events-none relative">
        <motion.div 
          className="w-full bg-background border-b pointer-events-auto flex flex-col shadow-sm"
          initial={false}
          animate={isHeaderMinimized ? "collapsed" : "expanded"}
          variants={{
            expanded: { 
              height: '116px',
              transition: { duration: 0.2, ease: 'easeInOut' }
            },
            collapsed: { 
              height: '68px',
              transition: { duration: 0.18, ease: 'easeInOut' }
            }
          }}
        >
          {/* ردیف اول هدر دسکتاپ */}
          <div className="w-full px-4 lg:px-8 py-3 h-[68px] flex items-center">
            <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
              <Logo className="pt-0" />
              
              <div className="flex-1 max-w-2xl mx-4">
                <SearchBar 
                  placeholder="جستجوی هوشمند قطعات..."
                  onSearch={handleSearch}
                  isMobile={false}
                />
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <SellerButton />
                <ThemeToggle />
                <AuthButton />
                <CartButton />
              </div>
            </div>
          </div>

          {/* ردیف دوم هدر دسکتاپ همراه با انیمیشن روان ارتفاع */}
          <motion.div
            initial={false}
            animate={isHeaderMinimized ? "collapsed" : "expanded"}
            variants={{
              expanded: { 
                height: '48px', 
                opacity: 1,
                transition: { duration: 0.2, ease: 'easeInOut' }
              },
              collapsed: { 
                height: 0, 
                opacity: 0,
                transition: { duration: 0.15, ease: 'easeInOut' }
              }
            }}
            // مدیریت سرریز منو برای باز شدن مگامنو بدون مشکل قیچی شدن
            className={cn(
              "w-full border-t bg-muted/30",
              isHeaderMinimized ? "overflow-hidden pointer-events-none" : "overflow-visible"
            )}
          >
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
              <div className="flex items-center justify-between h-12">
                <DesktopNavigation />
                <div className="flex items-center gap-4">
                  <MyCarButton />
                  <CitySelector />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ===== موبایل (تا lg) ===== */}
      <div className="lg:hidden w-full px-4 py-2 bg-background">
        <div className="max-w-screen-2xl mx-auto">
          <MobileHeader onSearch={handleSearch} isScrolled={isHeaderMinimized} />
        </div>
      </div>
    </header>
  );
}