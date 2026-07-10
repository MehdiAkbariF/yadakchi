// src/app/(public)/home/page.tsx

import { MainLayout } from '@/components/shared/Layouts/MainLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProductGrid } from '@/components/features/ProductGrid';
import { getProductService } from '@/domains/front/product/services/product.service';
import { Typography } from '@/components/primitives/Typography';

export default async function HomePage() {
  const productService = getProductService();
  
  let products = [];
  let error = null;
  
  try {
    const result = await productService.searchProducts({
      pageNumber: 1,
      pageSize: 8,
      orderType: 'MostVisited',
    });
    products = result.items || [];
  } catch (err: any) {
    console.error('Error fetching products:', err);
    error = err.userMessage || 'خطا در دریافت محصولات';
  }

  return (
    <MainLayout>
      <HeroSection />

      <section className="mt-12">
        <Typography variant="h2" className="mb-6">
          محصولات پرطرفدار
        </Typography>
        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
            <Typography color="destructive">{error}</Typography>
          </div>
        ) : (
          <ProductGrid products={products} columns={4} />
        )}
      </section>

      <section className="mt-12">
        <Typography variant="h2" className="mb-6">
          محصولات جدید
        </Typography>
        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
            <Typography color="destructive">{error}</Typography>
          </div>
        ) : (
          <ProductGrid products={products.slice(0, 4)} columns={4} />
        )}
      </section>
    </MainLayout>
  );
}