// src/app/(public)/page/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaticService } from '@/domains/front/static/services/static.service';
import { StaticPageContent } from '@/components/features/Static/StaticPageContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getStaticService().getStaticPage(slug);

  if (!page) {
    return { title: 'صفحه یافت نشد' };
  }

  const meta: Metadata = {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || undefined,
    keywords: page.seo?.metaKeywords || undefined,
    alternates: page.seo?.canonicalUrl
      ? { canonical: page.seo.canonicalUrl }
      : undefined,
  };

  if (page.noIndex) {
      if (page.noIndex) {
    meta.robots = { index: false, follow: false };
  }
  }

  return meta;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getStaticService().getStaticPage(slug);

  if (!page) {
    notFound();
  }

  return <StaticPageContent slug={slug} initialPage={page} />;
}