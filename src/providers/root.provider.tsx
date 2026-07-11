// src/providers/root.provider.tsx

'use client';

import { QueryProvider } from './query.provider';
import { ThemeProvider } from './theme.provider';
import { Toaster } from 'react-hot-toast';

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
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