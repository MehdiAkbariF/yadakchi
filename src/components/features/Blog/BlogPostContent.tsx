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
  ArrowLeft,
  BookOpen
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

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.summary || post.title,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // نادیده گرفتن انصراف کاربر از اشتراک‌گذاری
      }
    } else if (typeof navigator !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      showToast.success('لینک مقاله در کلیپ‌بورد کپی شد');
    }
  };

  return (
    <main className="w-full flex flex-col gap-6 sm:gap-8 pb-16" dir="rtl">
      
      {/* ناوبری مسیر */}
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* بدنه اصلی مقاله */}
        <article className="lg:col-span-8 flex flex-col gap-6 bg-card border border-border/70 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 shadow-xs">
          
          {/* هدر مقاله و متادیتا */}
          <header className="flex flex-col gap-4 border-b border-border/60 pb-6">
            {post.category && (
              <Link 
                href={`/blog?category=${post.category.id}`}
                className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-lg transition-colors"
              >
                {post.category.title}
              </Link>
            )}

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-black text-foreground leading-tight sm:leading-snug">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 sm:gap-5 flex-wrap text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                  <User className="h-4 w-4 text-primary shrink-0" />
                  {post.author.fullName}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                  <time>زمان مطالعه: {toPersianDigits(post.readTime)} دقیقه</time>
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-8 sm:h-9 px-3 text-xs font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform"
                aria-label="اشتراک‌گذاری مقاله"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>اشتراک‌گذاری</span>
              </Button>
            </div>
          </header>

          {/* تصویر شاخص */}
          {post.imageUrl && (
            <figure className="relative w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-muted border border-border/40 shadow-xs">
              <Image
                src={getFullUrl(post.imageUrl)}
                alt={post.imageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover object-center"
              />
            </figure>
          )}

          {/* خلاصه مقاله (Lead Paragraph) */}
          {post.summary && (
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-primary/[0.04] border-r-4 border-primary text-xs sm:text-sm font-medium leading-loose text-foreground/90">
              {post.summary}
            </div>
          )}

          {/* محتوای متنی غنی (HTML Prose) مهندسی شده برای فارسی */}
          <div 
            className="text-foreground text-sm sm:text-base leading-loose sm:leading-loose text-justify space-y-5
              [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-black [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-r-2 [&_h2]:border-primary [&_h2]:pr-3
              [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:leading-loose [&_p]:text-foreground/90
              [&_a]:text-primary [&_a]:underline [&_a]:font-medium [&_a]:underline-offset-4 hover:[&_a]:opacity-80
              [&_img]:rounded-xl sm:[&_img]:rounded-2xl [&_img]:border [&_img]:border-border/60 [&_img]:my-6 [&_img]:w-full
              [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:space-y-2 [&_ul]:marker:text-primary
              [&_ol]:list-decimal [&_ol]:pr-5 [&_ol]:space-y-2 [&_ol]:marker:text-primary
              [&_blockquote]:border-r-4 [&_blockquote]:border-border [&_blockquote]:pr-4 [&_blockquote]:py-1 [&_blockquote]:text-muted-foreground [&_blockquote]:italic
              [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:p-2.5 [&_th]:bg-muted/50 [&_td]:border [&_td]:border-border [&_td]:p-2.5"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />

          {/* پرسش‌های متداول (FAQ) */}
          {post.faqs.length > 0 && (
            <section aria-labelledby="faq-section-title" className="border-t border-dashed border-border/80 pt-8 mt-4 flex flex-col gap-4">
              <h2 id="faq-section-title" className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                پرسش‌های متداول درباره این مطلب
              </h2>

              <div className="flex flex-col gap-2.5">
                {post.faqs.map((faq) => (
                  <Accordion key={faq.id} title={faq.question} defaultOpen={false}>
                    <p className="text-xs sm:text-sm leading-loose text-muted-foreground pr-2 pb-2">
                      {faq.answer}
                    </p>
                  </Accordion>
                ))}
              </div>
            </section>
          )}

          {/* کامنت‌ها */}
          <BlogCommentsSection blogPostId={post.id} />

        </article>

        {/* سایدبار با قابلیت Sticky هوشمند در دسکتاپ */}
        <aside className="lg:col-span-4 w-full flex flex-col gap-6 lg:sticky lg:top-24">
          
          {/* قطعات یدکی مرتبط */}
          {post.parts.length > 0 && (
            <div className="w-full bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Wrench className="h-4 w-4 text-primary" />
                <h3 className="text-xs sm:text-sm font-black text-foreground">قطعات مرتبط با این مقاله</h3>
              </div>

              <div className="flex flex-col gap-2">
                {post.parts.map((part) => (
                  <Link
                    key={part.id}
                    href={part.englishTitle ? `/search?partEnglishTitle=${encodeURIComponent(part.englishTitle)}` : `/search?q=${encodeURIComponent(part.name)}`}
                    className="group p-2.5 sm:p-3 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between gap-2 text-xs font-bold"
                  >
                    <span className="truncate">{part.name}</span>
                    <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:-translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* خودروهای مرتبط */}
          {post.carTypes.length > 0 && (
            <div className="w-full bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="text-xs sm:text-sm font-black text-foreground">خودروهای مرتبط</h3>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {post.carTypes.map((car) => (
                  <Link
                    key={car.id}
                    href={`/search?carIds=${car.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border/60 bg-background text-foreground font-semibold hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all"
                  >
                    لوازم یدکی {car.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* بنر CTA سایدبار */}
          <div className="relative overflow-hidden w-full bg-gradient-to-br from-primary/10 via-primary/5 to-card border border-primary/20 rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-black">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="text-xs">مجله قطعات یدک‌چی</span>
            </div>
            <h4 className="text-sm font-black text-foreground">علاقه‌مند به مطالب بیشتر هستید؟</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              صدها مقاله تخصصی و راهنمای نگهداری و خرید قطعات انواع خودرو در دسترس شماست.
            </p>
            <Link href="/blog" className="mt-2 block">
              <Button variant="primary" size="sm" fullWidth className="h-10 text-xs font-bold rounded-xl active:scale-98">
                مشاهده همه مقالات
              </Button>
            </Link>
          </div>

        </aside>

      </div>

    </main>
  );
}