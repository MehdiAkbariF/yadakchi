import { CarDetailsContent } from '@/components/features/Car/CarDetailsContent';
import { MainLayout } from '@/components/shared/Layouts/MainLayout';

interface CarPageProps {
  params: { slug: string };
}

export default async function CarPage({ params }: CarPageProps) {
  return (
    <MainLayout>
      <CarDetailsContent slug={params.slug} />
    </MainLayout>
  );
}