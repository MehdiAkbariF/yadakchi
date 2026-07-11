// src/app/(public)/home/page.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { Typography } from '@/components/primitives/Typography';
import { getServerCurrentUser } from '@/domains/auth/server.auth'; // 🚨 ایمپورت از فایل جدید سمت سرور
import { queryKeys } from '@/lib/react-query/query-keys';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function HomePage() {
  // 1. ساخت یک نمونه موقت از QueryClient برای سمت سرور
  const queryClient = new QueryClient();

  // 2. گرفتن اطلاعات کاربر در سمت سرور (با استفاده از کوکی)
  const user = await getServerCurrentUser();

  // 3. قرار دادن اطلاعات کاربر در کش React Query
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
  }

  // 4. ارسال کش به صورت همزمان با HTML به مرورگر (Hydration)
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Typography variant="h1" className="font-iran-yekan">
            به یدکچی خوش آمدید
          </Typography>
          
          <Typography variant="lead" color="muted" className="font-iran-sans">
            {user ? (
              `سلام ${user.shopTitle || user.fullName || 'کاربر'} عزیز`
            ) : (
              'بزرگترین مارکت‌پلیس خودرو و قطعات یدکی در ایران'
            )}
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
    </HydrationBoundary>
  );
}