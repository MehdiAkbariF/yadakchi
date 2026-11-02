// src/app/(public)/basket/layout.tsx
import { FlowLayout } from '@/components/features/CheckoutFlow';

export default function BasketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FlowLayout step="basket" contentClassName="max-w-8xl">
      {children}
    </FlowLayout>
  );
}