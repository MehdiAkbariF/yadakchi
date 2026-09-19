// src/components/features/Blog/components/BlogCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, ArrowLeft, Layers, Settings } from 'lucide-react';
import { BlogPostItemViewModel } from '@/domains/blog/types/view.types';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

interface BlogCardProps {
  post: BlogPostItemViewModel;
}

export function BlogCard({ post }: BlogCardProps) {
  const postUrl = `/blog/${encodeURIComponent(post.englishTitle)}`;

  return (
    <article 
      dir="rtl"
      className="group flex flex-col h-full bg-card rounded-2xl border border-border/60 overflow-hidden shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20"
    >
      {/* مدیا و کاور */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/40">
        <Link href={postUrl} tabIndex={-1} className="block w-full h-full">
          <Image
            src={getFullUrl(post.imageUrl)}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
          />
        </Link>
        {post.category && (
          <span className="absolute top-3 right-3 z-10 px-2.5 py-1 text-[11px] font-bold text-foreground bg-background/85 backdrop-blur-md rounded-lg border border-border/40 shadow-xs pointer-events-none">
            {post.category.title}
          </span>
        )}
      </div>

      {/* بدنه محتوایی (با قابلیت رشد برای تراز شدن فوتر) */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        
        {/* متاداده: نویسنده و زمان مطالعه */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-medium">
          <span className="inline-flex items-center gap-1.5 truncate max-w-[50%]">
            <User className="h-3.5 w-3.5 shrink-0 text-primary/80" />
            <span className="truncate">{post.authorName}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 shrink-0">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{toPersianDigits(post.readTime)} دقیقه</span>
          </span>
        </div>

        {/* عنوان مقاله */}
        <h3 className="text-base font-extrabold text-foreground leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-primary">
          <Link href={postUrl} className="focus-visible:outline-none focus-visible:underline">
            {post.title}
          </Link>
        </h3>

        {/* تگ‌های قطعات و خودرو */}
        {(post.carTypes.length > 0 || post.parts.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2">
            {post.carTypes.slice(0, 2).map((c) => (
              <span 
                key={c.id} 
                className="inline-flex items-center gap-1 text-[10px] font-semibold bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md border border-border/30"
              >
                <Layers className="h-2.5 w-2.5 text-primary shrink-0" />
                <span className="truncate max-w-[90px]">{c.name}</span>
              </span>
            ))}
            {post.parts.slice(0, 1).map((p) => (
              <span 
                key={p.id} 
                className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20"
              >
                <Settings className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-[90px]">{p.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* فوتر کارت با دکمه اکشن (همیشه چسبیده به پایین کارت) */}
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
          <Link 
            href={postUrl} 
            tabIndex={-1}
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-primary/90"
          >
            <span>مطالعه مقاله</span>
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-1.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}