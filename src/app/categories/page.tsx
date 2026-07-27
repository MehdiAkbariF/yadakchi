import { getBannerService } from '@/domains/front/banner/services/banner.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { CategoriesContent } from '@/components/features/Categories/CategoriesContent';

export default async function CategoriesPage() {
  const queryClient = new QueryClient();
  const bannerService = getBannerService();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['front', 'mega-menu'],
      queryFn: () => bannerService.getMegaMenu(),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesContent />
    </HydrationBoundary>
  );
}