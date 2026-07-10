// src/app/(public)/home/page.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { Typography } from '@/components/primitives/Typography';

export default async function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[600vh] space-y-4">
        {/* تست فونت ایران‌یکان برای تیترها */}
        <Typography variant="h1" className="font-iran-yekan">
          به یادکچی خوش آمدید
        </Typography>
        
        {/* تست فونت ایران‌سنس برای متن */}
        <Typography variant="lead" color="muted" className="font-iran-sans">
          بزرگترین مارکت‌پلیس خودرو و قطعات یدکی در ایران
        </Typography>
        
        <div className="mt-8 flex gap-4">
          <div className="rounded-lg border p-4 text-center">
            <Typography variant="h4" className="font-iran-yekan">
              ایران‌یکان
            </Typography>
            <Typography variant="small" color="muted" className="font-iran-sans">
              برای تیترها و عناوین
            </Typography>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <Typography variant="h4" className="font-iran-sans">
              ایران‌سنس
            </Typography>
            <Typography variant="small" color="muted" className="font-iran-sans">
              برای متن اصلی
            </Typography>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}