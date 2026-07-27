
import dynamic from 'next/dynamic';

const CheckoutContent = dynamic(
  () => import('@/components/features/Checkout/CheckoutContent'),
  { ssr: false }
);

export default async function CheckoutPage() {
  return (
    
      <CheckoutContent />
    
  );
}