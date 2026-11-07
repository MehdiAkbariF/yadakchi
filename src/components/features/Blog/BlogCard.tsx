'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft, Layers, Wrench } from 'lucide-react';
import { BlogPostItemViewModel } from '@/domains/blog/types/view.types';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

export interface BlogCardProps {
  post: BlogPostItemViewModel;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const postUrl = `/blog/${encodeURIComponent(post.englishTitle)}`;
  const authorInitial = post.authorName ? post.authorName.trim().charAt(0) : 'ن';

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card',
        'shadow-xs transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
      )}
    >
      {/* مدیا / تصویر مقاله با زوم نرم */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Link href={postUrl} tabIndex={-1} className="block h-full w-full">
          <Image
            src={getFullUrl(post.imageUrl)}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
          />
        </Link>

        {/* بج دسته‌بندی روی تصویر */}
        {post.category ? (
          <span className="pointer-events-none absolute start-3 top-3 z-10 rounded-full border border-border/60 bg-card/90 px-3 py-1 text-3xs font-bold tracking-wide text-primary shadow-xs backdrop-blur-md">
            {post.category.title}
          </span>
        ) : null}
      </div>

      {/* بدنه محتوا */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* تگ فنی کوچک بالای تیتر */}
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-3xs font-bold uppercase tracking-wider text-primary">
            بررسی فنی و تخصصی
          </span>
        </div>

        {/* تیتر مقاله با انیمیشن رنگ و خط زیرین در هاور */}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
          <Link href={postUrl} className="focus-visible:underline focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>

        {/* تگ‌های مرتبط با خودرو و قطعات (Technical Spec Chips) */}
        {(post.carTypes.length > 0 || post.parts.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {post.carTypes.slice(0, 2).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-3xs font-semibold text-muted-foreground transition-colors group-hover:border-primary/20"
              >
                <Layers aria-hidden="true" className="h-2.5 w-2.5 shrink-0 text-primary" />
                <span className="max-w-[6.25rem] truncate">{c.name}</span>
              </span>
            ))}
            {post.parts.slice(0, 1).map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-3xs font-semibold text-muted-foreground"
              >
                <Wrench aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
                <span className="max-w-[6.25rem] truncate">{p.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* نوار فوتر کارت: آواتار نویسنده، زمان مطالعه و دکمه ادامه */}
        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4 mt-5 text-2xs text-muted-foreground">
          {/* نویسنده */}
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xs font-bold text-primary">
              {authorInitial}
            </div>
            <span className="truncate font-medium text-foreground/80">{post.authorName}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{toPersianDigits(post.readTime)} دقیقه</span>
            </span>
          </div>

          {/* آیکون فلش هاور */}
          <Link
            href={postUrl}
            tabIndex={-1}
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:-translate-x-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}