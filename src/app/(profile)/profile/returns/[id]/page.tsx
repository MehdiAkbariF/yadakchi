import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ReturnDetails } from '@/components/features/Profile/ReturnDetails';

interface ReturnDetailsPageProps {
  params: { id: string };
}

export default async function ReturnDetailsPage({ params }: ReturnDetailsPageProps) {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const userPanelService = getUserPanelService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'return-requests', 'details', params.id],
      queryFn: () => userPanelService.getReturnRequestDetails(params.id),
    });
  } catch {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReturnDetails returnId={params.id} />
    </HydrationBoundary>
  );
}