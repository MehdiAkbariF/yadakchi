// src/components/features/Blog/components/BlogCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, ArrowLeft, Tag, Layers, Settings } from 'lucide-react';
import { BlogPostItemViewModel } from '@/domains/blog/types/view.types';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';

interface BlogCardProps {
  post: BlogPostItemViewModel;
}

export function BlogCard({ post }: BlogCardProps) {
  const postUrl = `/blog/${encodeURIComponent(post.englishTitle)}`;

  return (
    <article className="w-full bg-card rounded-2xl border hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group select-none text-right" dir="rtl">
      
      <div>
        {/* تصویر شاخص */}
        <Link href={postUrl} className="block relative w-full aspect-[16/10] overflow-hidden bg-muted/20">
          <Image
            src={getFullUrl(post.imageUrl)}
            alt={post.imageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {post.category && (
            <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-md text-foreground font-black text-[10px] px-2.5 py-1 rounded-lg border shadow-sm">
              {post.category.title}
            </span>
          )}
        </Link>

        {/* محتوای متنی */}
        <div className="p-4 md:p-5 flex flex-col gap-2.5">
          
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-iran-yekan font-medium">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-primary" />
              {post.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              {toPersianDigits(post.readTime)} دقیقه مطالعه
            </span>
          </div>

          <Link href={postUrl} className="group-hover:text-primary transition-colors">
            <h3 className="text-sm sm:text-base font-black text-foreground line-clamp-2 leading-relaxed font-iran-yekan mt-1">
              {post.title}
            </h3>
          </Link>

          {/* تگ‌های مرتبط خودرو و قطعه */}
          {(post.carTypes.length > 0 || post.parts.length > 0) && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.carTypes.slice(0, 2).map((c) => (
                <span key={c.id} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Layers className="h-2.5 w-2.5 text-primary" />
                  {c.name}
                </span>
              ))}
              {post.parts.slice(0, 1).map((p) => (
                <span key={p.id} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Settings className="h-2.5 w-2.5" />
                  {p.name}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* فوتر کارت */}
      <div className="p-4 md:p-5 pt-0 border-t border-dashed mt-3 pt-3 flex items-center justify-between text-xs font-bold font-iran-yekan text-primary">
        <Link href={postUrl} className="flex items-center gap-1 hover:underline">
          <span>ادامه مطلب</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

    </article>
  );
}