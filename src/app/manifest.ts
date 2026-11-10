import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'یدکچی | بازارگاه تخصصی قطعات خودرو',
    short_name: 'یدکچی',
    description: 'بزرگ‌ترین مارکت‌پلیس قطعات خودرو و لوازم یدکی در ایران',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#CE3E04', // اصلاح شد: مطابق با رنگ برند جدید
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}