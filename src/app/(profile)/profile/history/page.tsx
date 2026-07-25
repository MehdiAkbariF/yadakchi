import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { RecentlyViewedList } from '@/components/features/Profile/RecentlyViewedList';

export default async function HistoryPage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const userPanelService = getUserPanelService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'recent-views', 'list'],
      queryFn: () => userPanelService.getRecentlyViewedProducts(),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecentlyViewedList />
    </HydrationBoundary>
  );
}