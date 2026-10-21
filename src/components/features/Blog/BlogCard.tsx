'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, ArrowLeft, Layers, Settings } from 'lucide-react';
import { BlogPostItemViewModel } from '@/domains/blog/types/view.types';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';
export interface BlogCardProps {
  post: BlogPostItemViewModel;
}

export function BlogCard({ post }: BlogCardProps) {
  const postUrl = `/blog/${encodeURIComponent(post.englishTitle)}`;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card',
        'shadow-xs transition-all duration-normal ease-in-out',
        'hover:border-primary/40 hover:shadow-sm',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background'
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Link href={postUrl} tabIndex={-1} className="block h-full w-full">
          <Image
            src={getFullUrl(post.imageUrl)}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-slow ease-out will-change-transform group-hover:scale-105"
          />
        </Link>
        {post.category ? (
          <span className="pointer-events-none absolute end-3 top-3 z-10 rounded-sm border border-border bg-card/85 px-2.5 py-1 text-2xs font-bold text-foreground backdrop-blur-md">
            {post.category.title}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="inline-flex max-w-[50%] items-center gap-1.5 truncate">
            <User aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{post.authorName}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <Clock aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{toPersianDigits(post.readTime)} دقیقه</span>
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors duration-fast group-hover:text-primary">
          <Link href={postUrl} className="focus-visible:underline focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>

        {post.carTypes.length > 0 || post.parts.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
            {post.carTypes.slice(0, 2).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-secondary px-2 py-0.5 text-2xs font-semibold text-secondary-foreground"
              >
                <Layers aria-hidden="true" className="h-2.5 w-2.5 shrink-0 text-primary" />
                <span className="max-w-[90px] truncate">{c.name}</span>
              </span>
            ))}
            {post.parts.slice(0, 1).map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted px-2 py-0.5 text-2xs font-semibold text-foreground"
              >
                <Settings aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
                <span className="max-w-[90px] truncate">{p.name}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <Link
            href={postUrl}
            tabIndex={-1}
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors group-hover:text-primary-hover"
          >
            <span>مطالعه مقاله</span>
            <ArrowLeft
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-normal ease-out group-hover:-translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
