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
        <NextTopLoader 
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={250}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="cubic-bezier(0.22, 1, 0.36, 1)"
          speed={550}
          shadow="0 0 10px rgba(37, 99, 235, 0.7), 0 0 4px rgba(6, 182, 212, 0.4)"
          zIndex={999999}
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
              borderRadius: '0.875rem',
              padding: '12px 20px',
              fontSize: '0.8125rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            },
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  );
}