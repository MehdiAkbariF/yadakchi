// src/app/layout.tsx

import type { Metadata } from 'next';
import { RootProvider } from '@/providers/root.provider';
import { env } from '@/core/config/env';
import './globals.css';

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
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}