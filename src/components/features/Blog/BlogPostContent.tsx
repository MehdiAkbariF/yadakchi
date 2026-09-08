// src/components/features/Blog/BlogPostContent.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Clock, 
  User, 
  Share2, 
  HelpCircle, 
  Layers, 
  Wrench, 
  ArrowLeft 
} from 'lucide-react';
import { BlogPostDetailViewModel } from '@/domains/blog/types/view.types';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Button } from '@/components/primitives/Button/Button';
import { BlogCommentsSection } from './BlogCommentsSection';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';

interface BlogPostContentProps {
  post: BlogPostDetailViewModel;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const breadcrumbItems = [
    { id: 'blog-root', title: 'مجله تخصصی یدک‌چی', href: '/blog' },
    ...(post.category ? [{ id: post.category.id, title: post.category.title, href: `/blog?category=${post.category.id}` }] : []),
    { id: 'post-active', title: post.title },
  ];

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast.success('لینک مقاله در کلیپ‌بورد کپی شد');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-right select-none" dir="rtl">
      
      <Breadcrumb items={breadcrumbItems} />

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* بدنه اصلی مقاله */}
        <article className="lg:col-span-8 flex flex-col gap-6 bg-card border rounded-2xl p-5 md:p-8 shadow-sm">
          
          {/* عنوان و متادیتا */}
          <div className="flex flex-col gap-4 border-b pb-5">
            {post.category && (
              <span className="self-start bg-primary/10 text-primary font-black text-xs px-3 py-1 rounded-lg">
                {post.category.title}
              </span>
            )}

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-relaxed font-iran-yekan">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-iran-yekan pt-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  {post.author.fullName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  زمان مطالعه: {toPersianDigits(post.readTime)} دقیقه
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="rounded-xl text-xs font-bold h-9 px-3 flex items-center gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>اشتراک‌گذاری</span>
              </Button>
            </div>
          </div>

          {/* تصویر شاخص مقاله */}
          {post.imageUrl && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-muted/20 border shadow-sm">
              <Image
                src={getFullUrl(post.imageUrl)}
                alt={post.imageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          )}

          {/* خلاصه مقاله در صورت وجود */}
          {post.summary && (
            <div className="p-4 rounded-xl bg-muted/30 border-r-4 border-primary text-xs sm:text-sm font-medium leading-relaxed text-foreground">
              {post.summary}
            </div>
          )}

          {/* محتوای کامل HTML مقاله */}
          <div 
            className="text-xs sm:text-sm md:text-base leading-loose text-justify text-foreground font-iran-yekan space-y-4 [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:font-black [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-primary [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-loose [&_img]:rounded-2xl [&_img]:my-4 [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />

          {/* سوالات متداول (FAQ) */}
          {post.faqs.length > 0 && (
            <div className="flex flex-col gap-3.5 border-t border-dashed pt-8 mt-4">
              <span className="text-base font-black text-foreground font-iran-yekan flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                پرسش‌های متداول درباره این مطلب
              </span>

              <div className="flex flex-col gap-2">
                {post.faqs.map((faq) => (
                  <Accordion key={faq.id} title={faq.question} defaultOpen={false}>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground pr-1 pb-2">
                      {faq.answer}
                    </p>
                  </Accordion>
                ))}
              </div>
            </div>
          )}

          {/* بخش دیدگاه‌ها و نظرات کاربران */}
          <BlogCommentsSection blogPostId={post.id} />

        </article>

        {/* سایدبار کناری */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* قطعات و لوازم یدکی مرتبط */}
          {post.parts.length > 0 && (
            <div className="w-full bg-card border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <span className="text-sm font-black text-foreground font-iran-yekan flex items-center gap-2 border-b pb-3">
                <Wrench className="h-4.5 w-4.5 text-primary" />
                قطعات مرتبط با این مقاله
              </span>

              <div className="flex flex-col gap-2.5">
                {post.parts.map((part) => (
                  <Link
                    key={part.id}
                    href={part.englishTitle ? `/search?partEnglishTitle=${encodeURIComponent(part.englishTitle)}` : `/search?q=${encodeURIComponent(part.name)}`}
                    className="p-3 rounded-xl border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between gap-3 text-xs font-bold font-iran-yekan"
                  >
                    <span>{part.name}</span>
                    <ArrowLeft className="h-4 w-4 text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* خودروهای مرتبط */}
          {post.carTypes.length > 0 && (
            <div className="w-full bg-card border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <span className="text-sm font-black text-foreground font-iran-yekan flex items-center gap-2 border-b pb-3">
                <Layers className="h-4.5 w-4.5 text-primary" />
                خودروهای مرتبط
              </span>

              <div className="flex flex-wrap gap-2">
                {post.carTypes.map((car) => (
                  <Link
                    key={car.id}
                    href={`/search?carIds=${car.id}`}
                    className="text-xs px-3.5 py-2 rounded-xl border bg-background text-foreground font-bold hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    لوازم یدکی {car.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* کارت لینک مجله */}
          <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col gap-3 text-right">
            <span className="text-sm font-black text-foreground font-iran-yekan">علاقه‌مند به مطالب بیشتر هستید؟</span>
            <p className="text-xs text-muted-foreground leading-relaxed font-iran-yekan">
              در مجله تخصصی یدک‌چی صدها مقاله آموزشی و راهنمای تخصصی نگهداری و خرید قطعات خودرو در دسترس شماست.
            </p>
            <Link href="/blog" className="mt-2">
              <Button variant="primary" size="sm" fullWidth className="rounded-xl font-iran-yekan font-bold text-xs h-10">
                مشاهده همه مقالات مجله
              </Button>
            </Link>
          </div>

        </aside>

      </div>

    </div>
  );
}