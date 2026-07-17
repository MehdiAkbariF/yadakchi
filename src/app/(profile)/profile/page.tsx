import { getServerCurrentUser } from '@/domains/auth/server.auth'; 
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ProfileDashboard } from '@/components/features/Profile/ProfileDashboard';

export default async function ProfilePage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const userPanelService = getUserPanelService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['user', 'wallet', 'balances'],
        queryFn: () => userPanelService.getWalletBalances(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'vehicles', 'list'],
        queryFn: () => userPanelService.getUserVehicles(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'orders', 'list', { status: '', searchedValue: '', orderBy: '', pageNumber: 1 }],
        queryFn: () => userPanelService.getOrders('', '', '', 1, 10),
      })
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileDashboard />
    </HydrationBoundary>
  );
}