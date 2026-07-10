// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { RootProvider } from '@/providers/root.provider';
import { env } from '@/core/config/env';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: env.appName,
  description: 'بزرگترین مارکت‌پلیس خودرو و قطعات یدکی',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={inter.className}>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}