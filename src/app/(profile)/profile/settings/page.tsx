import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getAuthService } from '@/domains/auth/services/auth.service';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SettingsForm } from '@/components/features/Profile/SettingsForm';

export default async function SettingsPage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const authService = getAuthService();
  const userPanelService = getUserPanelService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['auth', 'user'],
        queryFn: () => authService.getCurrentUser(),
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'bank-accounts', 'list'],
        queryFn: () => userPanelService.getBankAccounts(),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsForm />
    </HydrationBoundary>
  );
}