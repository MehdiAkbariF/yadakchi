// src/app/(auth)/layout.tsx

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background w-full flex flex-col" dir="rtl">
      {children}
    </div>
  );
}