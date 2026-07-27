
import dynamic from 'next/dynamic';

const BasketPaymentContent = dynamic(
  () => import('@/components/features/BasketPayment/BasketPaymentContent'),
  { ssr: false }
);

export default async function BasketPaymentPage() {
  return (
 
      <BasketPaymentContent />

  );
}