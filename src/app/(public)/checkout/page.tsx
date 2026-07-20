import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import dynamic from 'next/dynamic';

const CheckoutContent = dynamic(
  () => import('@/components/features/Checkout/CheckoutContent'),
  { ssr: false }
);

export default async function CheckoutPage() {
  return (
    <MainLayout>
      <CheckoutContent />
    </MainLayout>
  );
}