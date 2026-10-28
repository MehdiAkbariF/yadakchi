import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ReturnsList } from '@/components/features/Profile/ReturnsList';

interface ReturnsPageProps {
  searchParams: { status?: string; page?: string };
}

export default async function ReturnsPage({ searchParams }: ReturnsPageProps) {
  const status = searchParams.status || '';
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const userPanelService = getUserPanelService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: [
        'user',
        'return-requests',
        'list',
        { pageNumber: page, status, subOrderId: undefined },
      ],
      queryFn: () => userPanelService.getReturnRequests(page, 10, status),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReturnsList initialStatus={status} initialPage={page} />
    </HydrationBoundary>
  );
}