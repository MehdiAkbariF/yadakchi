// src/providers/root.provider.tsx

'use client';

import { QueryProvider } from './query.provider';
import { ThemeProvider } from './theme.provider';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';
import { PWAInstallBanner } from '@/shared/PWAInstallBanner/PWAInstallBanner';// وارد کردن بنر نصب PWA جدید

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {/* کانفیگ نوار لودینگ بالای صفحه */}
        <NextTopLoader 
          color="#F56D3C" 
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} 
          easing="ease"
          speed={200}
          shadow="0 0 10px #F56D3C,0 0 5px #F56D3C"
        />
        
        {children}
        
        {/* فعال‌سازی بنر نصب هوشمند و متمرکز وب‌اپلیکیشن (PWA) در کل وب‌سایت */}
        <PWAInstallBanner />
        
        {/* کانفیگ Toast سراسری */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              fontFamily: 'IRANSans, sans-serif',
              direction: 'rtl',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              maxWidth: '500px'
            },
            success: {
              icon: '✅',
              style: {
                background: '#22c55e',
                color: '#fff',
              },
            },
            error: {
              icon: '❌',
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  );
}