import { Metadata } from 'next';
import { getCarService } from '@/domains/front/reference/car/services/car.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { CarDetailsContent } from '@/components/features/Car/CarDetailsContent';
import { getFullUrl } from '@/core/utils/formatters';

interface CarPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
  const decodedCarModel = decodeURIComponent(params.slug).replace(/-/g, ' ');
  const carService = getCarService();
  const carData = await carService.getCarPage(decodedCarModel);

  if (!carData) {
    return {
      title: 'قطعات خودرو | یدک‌چی',
    };
  }

  const cleanDesc = carData.description || '';

  return {
    title: `خرید لوازم یدکی و قطعات ${carData.model} | یدک‌چی`,
    description: cleanDesc.slice(0, 160) || `خرید جدیدترین قطعات یدکی، لوازم بدنه و ابزارآلات تخصصی خودروی ${carData.model} با ضمانت اصالت کالا و ارسال سریع از فروشگاه‌های معتبر سراسر کشور.`,
    alternates: {
      canonical: `https://www.yadakchi.com/car/${params.slug}`,
    },
    openGraph: {
      title: `خرید لوازم یدکی و قطعات ${carData.model} | یدک‌چی`,
      description: cleanDesc.slice(0, 160) || `خرید قطعات خودروی ${carData.model} در بازارگاه تخصصی یدک‌چی`,
      url: `https://www.yadakchi.com/car/${params.slug}`,
      siteName: 'یدک‌چی',
      locale: 'fa_IR',
      type: 'website',
      images: [
        {
          url: getFullUrl(carData.cover),
          width: 800,
          height: 600,
          alt: carData.model,
        },
      ],
    },
  };
}

export default async function CarPage({ params }: CarPageProps) {
  const queryClient = new QueryClient();
  const carService = getCarService();
  const decodedCarModel = decodeURIComponent(params.slug).replace(/-/g, ' ');

  const carData = await carService.getCarPage(decodedCarModel);

  if (carData) {
    queryClient.setQueryData(['reference', 'cars', 'page', decodedCarModel], carData);
  }

  const schemaJson = carData
    ? {
        "@context": "https://schema.org",
        "@type": "Car",
        "name": carData.model,
        "image": getFullUrl(carData.cover),
        "description": carData.description ? carData.description.replace(/<[^>]*>/g, '') : '',
        "brand": {
          "@type": "Brand",
          "name": carData.manufacturer.name,
        },
        "manufacturer": {
          "@type": "Organization",
          "name": carData.manufacturer.name,
        },
        "vehicleModelDate": carData.year ? String(carData.year) : undefined,
      }
    : null;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}
      <CarDetailsContent slug={params.slug} />
    </HydrationBoundary>
  );
}