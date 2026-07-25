import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { WalletDashboard } from '@/components/features/Profile/WalletDashboard';

export default async function WalletPage() {
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
        queryKey: ['user', 'bank-accounts', 'list'],
        queryFn: () => userPanelService.getBankAccounts(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'wallet', 'transactions', 1],
        queryFn: () => userPanelService.getTransactions(1, 10),
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'wallet', 'withdraw-requests', { pageNumber: 1, status: '' }],
        queryFn: () => userPanelService.getWithdrawRequests(1, 10, ''),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WalletDashboard />
    </HydrationBoundary>
  );
}