import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SettingsForm } from '@/components/features/Profile/SettingsForm';
import { cookies } from 'next/headers';

export default async function SettingsPage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();

  // ست کردن مستقیم کاربر در کش React Query
  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const userPanelService = getUserPanelService();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'bank-accounts', 'list'],
      queryFn: () => userPanelService.getBankAccounts({ cookie: cookieHeader }),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsForm />
    </HydrationBoundary>
  );
}