import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { OrderDetails } from '@/components/features/Profile/components/OrderDetails';

interface OrderDetailsPageProps {
  params: { id: string };
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const queryClient = new QueryClient();
  const userPanelService = getUserPanelService();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'orders', 'details', params.id],
      queryFn: () => userPanelService.getOrder(params.id),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderDetails orderId={params.id} />
    </HydrationBoundary>
  );
}