import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getUserPanelService } from '@/domains/userpanel/services/userpanel.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { FavoritesList } from '@/components/features/Profile/FavoritesList';

export default async function FavoritesPage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const userPanelService = getUserPanelService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'favorites', 'list', { pageNumber: 1, order: 'Latest' }],
      queryFn: () => userPanelService.getFavoriteProducts(1, 30, 'Latest'),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FavoritesList />
    </HydrationBoundary>
  );
}