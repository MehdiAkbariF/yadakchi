import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { NotificationsList } from '@/components/features/Profile/NotificationsList';

export default async function NotificationsPage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const userPanelService = getUserPanelService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'notifications', 'list', { pageNumber: 1, channel: '', priority: '', isRead: undefined, orderBy: 'Latest' }],
      queryFn: () => userPanelService.getUserNotifications(1, 10, '', '', undefined, undefined, undefined, undefined, 'Latest'),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsList />
    </HydrationBoundary>
  );
}