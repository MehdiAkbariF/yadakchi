'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, User, Share2, HelpCircle, Layers, Wrench, ArrowLeft, BookOpen } from 'lucide-react';
import { BlogPostDetailViewModel } from '@/domains/blog/types/view.types';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Button } from '@/components/primitives/Button/Button';
import { BlogCommentsSection } from './BlogCommentsSection';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';

export interface BlogPostContentProps {
  post: BlogPostDetailViewModel;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const breadcrumbItems = [
    { id: 'blog-root', title: 'مجله تخصصی یدک‌چی', href: '/blog' },
    ...(post.category
      ? [{ id: post.category.id, title: post.category.title, href: `/blog?category=${post.category.id}` }]
      : []),
    { id: 'post-active', title: post.title },
  ];

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.summary || post.title,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else if (typeof navigator !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      showToast.success('لینک مقاله در کلیپ‌بورد کپی شد');
    }
  };

  return (
    <main className="flex w-full flex-col gap-6 pb-16 sm:gap-8">
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <article className="flex flex-col gap-6 rounded-lg border border-border bg-card p-4 shadow-xs sm:p-7 lg:col-span-8 md:p-9">
          <header className="flex flex-col gap-4 border-b border-border pb-6">
            {post.category ? (
              <Link
                href={`/blog?category=${post.category.id}`}
                className="inline-flex items-center gap-1.5 self-start rounded-md bg-accent px-3 py-1 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent/80"
              >
                {post.category.title}
              </Link>
            ) : null}

            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-5">
                <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                  <User aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                  {post.author.fullName}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <time>زمان مطالعه: {toPersianDigits(post.readTime)} دقیقه</time>
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex h-9 items-center gap-1.5 px-3 text-xs font-bold"
                aria-label="اشتراک‌گذاری مقاله"
              >
                <Share2 aria-hidden="true" className="h-3.5 w-3.5" />
                <span>اشتراک‌گذاری</span>
              </Button>
            </div>
          </header>

          {post.imageUrl ? (
            <figure className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-border bg-muted shadow-xs">
              <Image
                src={getFullUrl(post.imageUrl)}
                alt={post.imageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover object-center"
              />
            </figure>
          ) : null}

          {post.summary ? (
            <div className="rounded-md border-s-4 border-primary bg-muted/50 p-4 text-sm font-medium leading-reading text-foreground/90 sm:p-5">
              {post.summary}
            </div>
          ) : null}

          <div
            className="space-y-5 text-justify text-sm leading-reading text-foreground sm:text-base
              [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:opacity-80
              [&_blockquote]:border-s-4 [&_blockquote]:border-border [&_blockquote]:ps-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-s-2 [&_h2]:border-primary [&_h2]:ps-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground
              [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground
              [&_img]:my-6 [&_img]:w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border
              [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pe-5 [&_ol]:marker:text-primary
              [&_p]:leading-reading [&_p]:text-foreground/90
              [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2.5 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2.5
              [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pe-5 [&_ul]:marker:text-primary"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />

          {post.faqs.length > 0 ? (
            <section
              aria-labelledby="faq-section-title"
              className="mt-4 flex flex-col gap-4 border-t border-dashed border-border pt-8"
            >
              <h2 id="faq-section-title" className="flex items-center gap-2 text-lg font-bold text-foreground">
                <HelpCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
                پرسش‌های متداول درباره این مطلب
              </h2>

              <div className="flex flex-col gap-2.5">
                {post.faqs.map((faq) => (
                  <Accordion key={faq.id} title={faq.question} defaultOpen={false}>
                    <p className="pb-2 pe-2 text-sm leading-reading text-muted-foreground">{faq.answer}</p>
                  </Accordion>
                ))}
              </div>
            </section>
          ) : null}

          <BlogCommentsSection blogPostId={post.id} />
        </article>

        <aside className="flex w-full flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4">
          {post.parts.length > 0 ? (
            <div className="flex w-full flex-col gap-3.5 rounded-lg border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Wrench aria-hidden="true" className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">قطعات مرتبط با این مقاله</h3>
              </div>

              <div className="flex flex-col gap-2">
                {post.parts.map((part) => (
                  <Link
                    key={part.id}
                    href={
                      part.englishTitle
                        ? `/search?partEnglishTitle=${encodeURIComponent(part.englishTitle)}`
                        : `/search?q=${encodeURIComponent(part.name)}`
                    }
                    className="group flex items-center justify-between gap-2 rounded-md border border-border bg-card p-2.5 text-xs font-bold transition-colors hover:border-primary/40 hover:bg-accent sm:p-3"
                  >
                    <span className="truncate">{part.name}</span>
                    <ArrowLeft
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-primary"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {post.carTypes.length > 0 ? (
            <div className="flex w-full flex-col gap-3.5 rounded-lg border border-border bg-card p-4 shadow-xs sm:p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Layers aria-hidden="true" className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">خودروهای مرتبط</h3>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {post.carTypes.map((car) => (
                  <Link
                    key={car.id}
                    href={`/search?carIds=${car.id}`}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    لوازم یدکی {car.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex w-full flex-col gap-3 overflow-hidden rounded-lg border border-accent bg-muted/50 p-5 sm:p-6">
            <div className="flex items-center gap-2 font-bold text-primary">
              <BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="text-xs">مجله قطعات یدک‌چی</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">علاقه‌مند به مطالب بیشتر هستید؟</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              صدها مقاله تخصصی و راهنمای نگهداری و خرید قطعات انواع خودرو در دسترس شماست.
            </p>
            <Link href="/blog" className="mt-2 block">
              <Button variant="primary" size="sm" fullWidth className="h-10 text-xs font-bold">
                مشاهده همه مقالات
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
