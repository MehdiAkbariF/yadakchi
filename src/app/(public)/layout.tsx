// src/app/(public)/layout.tsx


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // فقط children را برمی‌گردانیم، چون MainLayout قبلاً در صفحه استفاده شده
  return <>{children}</>;
}