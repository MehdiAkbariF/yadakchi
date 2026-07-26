import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'یدک‌چی | بازارگاه تخصصی قطعات خودرو',
    short_name: 'یدک‌چی',
    description: 'بزرگ‌ترین مارکت‌پلیس خودرو و قطعات یدکی در ایران',
    start_url: '/home',
    display: 'standalone', // اجرای اپلیکیشن بدون نوار ابزار مرورگر و به صورت بومی
    background_color: '#FFFFFF',
    theme_color: '#F56D3C', // رنگ برند یدک‌چی
    orientation: 'portrait', // اجرای اپلیکیشن فقط در حالت عمودی موبایل
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable', // برای سازگاری کامل با آیکون‌های گرد و لبه‌دار اندروید
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