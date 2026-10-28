// src/providers/root.provider.tsx
'use client';

import { QueryProvider } from './query.provider';
import { ThemeProvider } from './theme.provider';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';
import { PWAInstallBanner } from '@/shared/PWAInstallBanner/PWAInstallBanner';

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {/* نوار بارگذاری فوق‌باریک و سریع منطبق با استانداردهای یوتیوب و گیت‌هاب */}
        <NextTopLoader 
          color="#F56D3C" 
          initialPosition={0.15}
          crawlSpeed={150}
          height={2.5}
          crawl={true}
          showSpinner={false} 
          easing="cubic-bezier(0.2, 0.8, 0.2, 1)"
          speed={200}
          shadow="0 0 12px #F56D3C, 0 0 4px #F56D3C"
          zIndex={99999}
        />
        {children}
        <PWAInstallBanner />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              fontFamily: 'IRANYekan, sans-serif',
              direction: 'rtl',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '13px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            },
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  );
}