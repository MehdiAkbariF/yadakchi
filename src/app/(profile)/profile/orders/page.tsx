import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { OrdersList } from '@/components/features/Profile/OrdersList';

interface OrdersPageProps {
  searchParams: { status?: string; page?: string };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const status = searchParams.status || '';
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const queryClient = new QueryClient();
  const userPanelService = getUserPanelService();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'orders', 'list', { status, searchedValue: '', orderBy: '', pageNumber: page }],
      queryFn: () => userPanelService.getOrders(status, '', '', page, 10),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersList initialStatus={status} initialPage={page} />
    </HydrationBoundary>
  );
}