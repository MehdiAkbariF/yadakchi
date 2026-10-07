// src/app/(public)/page/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getStaticService } from '@/domains/front/static/services/static.service';
import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { queryKeys } from '@/lib/react-query/query-keys';
import { StaticPageContent } from '@/components/features/Static/StaticPageContent';

interface StaticPageRouteProps {
  params: { slug: string };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com';

// ============================================
// SEO داینامیک
// ============================================
export async function generateMetadata({ params }: StaticPageRouteProps): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const staticService = getStaticService();

  try {
    const page = await staticService.getStaticPage(slug);

    if (!page) {
      return {
        title: 'صفحه یافت نشد | یدک‌چی',
        robots: { index: false, follow: false },
      };
    }

    const metaTitle = page.seo?.metaTitle || `${page.title} | یدک‌چی`;
    const metaDescription = page.seo?.metaDescription || page.title;
    const canonical = page.seo?.canonicalUrl || `${BASE_URL}/page/${slug}`;

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: page.seo?.metaKeywords || undefined,
      alternates: {
        canonical,
      },
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonical,
        siteName: 'یدک‌چی',
        locale: 'fa_IR',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
      },
    };
  } catch (error) {
    return {
      title: 'صفحه یافت نشد | یدک‌چی',
      robots: { index: false, follow: false },
    };
  }
}

// ============================================
// ISR: بازتولید هر ۱۰ دقیقه
// ============================================
export const revalidate = 600;

// ============================================
// Server Component
// ============================================
export default async function StaticPageRoute({ params }: StaticPageRouteProps) {
  const queryClient = new QueryClient();
  const staticService = getStaticService();
  const slug = decodeURIComponent(params.slug);


  try {
    const user = await getServerCurrentUser();
    if (user) {
      queryClient.setQueryData(queryKeys.auth.user, user);
    }
  } catch (error) {
    // کاربر مهمان — مشکلی نیست
  }

  // ✅ Prefetch صفحه استاتیک
  let page = null;
  try {
    page = await staticService.getStaticPage(slug);
    if (page) {
      queryClient.setQueryData(['front', 'static-page', slug], page);
    }
  } catch (error) {
    // اگر API قطع بود، notFound نمی‌دیم — می‌ذاریم کلاینت هندل کنه
  }

  // ✅ اگر صفحه وجود نداره → 404
  if (!page) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaticPageContent slug={slug} initialPage={page} />
    </HydrationBoundary>
  );
}