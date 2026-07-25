import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getBasketService } from '@/domains/front/basket/services/basket.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { AddressesList } from '@/components/features/Profile/AddressesList';

export default async function AddressesPage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const basketService = getBasketService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'locations'],
      queryFn: () => basketService.getUserLocations(),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AddressesList />
    </HydrationBoundary>
  );
}