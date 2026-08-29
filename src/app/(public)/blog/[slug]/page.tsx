// src/app/(public)/blog/[slug]/page.tsx

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getBlogService } from '@/domains/blog/services/blog.service';
import { BlogPostContent } from '@/components/features/Blog/BlogPostContent';
import { getFullUrl } from '@/core/utils/formatters';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 300; // بازتولید کش دوره‌ای ۵ دقیقه

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const blogService = getBlogService();
  const decodedSlug = decodeURIComponent(params.slug);

  try {
    const post = await blogService.getPostDetail(decodedSlug);
    if (!post) return { title: 'مطلب یافت نشد | یدک‌چی' };

    const title = post.seo?.title || post.title;
    const description = post.seo?.description || post.summary || post.title;
    const canonical = post.seo?.canonicalUrl || `https://www.yadakchi.com/blog/${encodeURIComponent(post.englishTitle)}`;

    return {
      title: `${title} | مجله یدک‌چی`,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'article',
        images: post.imageUrl ? [{ url: getFullUrl(post.imageUrl) }] : [],
      },
    };
  } catch {
    return { title: 'مقاله یدک‌چی' };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const queryClient = new QueryClient();
  const blogService = getBlogService();
  const decodedSlug = decodeURIComponent(params.slug);

  let postDetail = null;

  try {
    postDetail = await blogService.getPostDetail(decodedSlug);
    if (postDetail) {
      queryClient.setQueryData(['blog', 'post', decodedSlug], postDetail);
    }
  } catch (error) {
    notFound();
  }

  if (!postDetail) {
    notFound();
  }

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postDetail.title,
    "image": postDetail.imageUrl ? [getFullUrl(postDetail.imageUrl)] : [],
    "author": {
      "@type": "Person",
      "name": postDetail.author.fullName
    },
    "publisher": {
      "@type": "Organization",
      "name": "یدک‌چی",
      "logo": {
        "@type": "ImageObject",
        "url": "https://api.yadakchi.com/Logo.svg"
      }
    },
    "description": postDetail.seo?.description || postDetail.summary || postDetail.title,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.yadakchi.com/blog/${encodeURIComponent(postDetail.englishTitle)}`
    }
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      <BlogPostContent post={postDetail} />
    </HydrationBoundary>
  );
}