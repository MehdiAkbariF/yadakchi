import { CarDetailsContent } from '@/components/features/Car/CarDetailsContent';


interface CarPageProps {
  params: { slug: string };
}

export default async function CarPage({ params }: CarPageProps) {
  return (
    
      <CarDetailsContent slug={params.slug} />
   
  );
}