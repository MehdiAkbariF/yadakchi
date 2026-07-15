import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import dynamic from 'next/dynamic';

const BasketSummary = dynamic(
  () => import('@/components/features/BasketSummary/BasketSummary'),
  { ssr: false }
);

export default async function BasketPage() {
  return (
    <MainLayout>
      <BasketSummary />
    </MainLayout>
  );
}