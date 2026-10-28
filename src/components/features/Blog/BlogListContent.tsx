'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Inbox,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  useGetBlogCategories,
  useGetBlogPosts,
  useGetBlogPostFilters,
} from '@/domains/blog/hooks/blog.hooks';
import { BlogCard } from './BlogCard';
import { BlogCardSkeleton } from './BlogCardSkeleton';
import { BlogSidebar } from './BlogSidebar';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

export function BlogListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  const selectedCategory = searchParams.get('category') || undefined;
  const selectedTitle = searchParams.get('q') || undefined;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const carTypeIds = searchParams.getAll('carTypeIds');
  const partIds = searchParams.getAll('partIds');

  const { data: categories = [] } = useGetBlogCategories();
  const { data: availableFilters } = useGetBlogPostFilters({
    blogCategoryId: selectedCategory,
    carTypeIds: carTypeIds.length ? carTypeIds : undefined,
    partIds: partIds.length ? partIds : undefined,
  });

  const { data: postsResponse, isLoading: isPostsLoading } = useGetBlogPosts({
    title: selectedTitle,
    blogCategoryId: selectedCategory,
    carTypeIds: carTypeIds.length ? carTypeIds : undefined,
    partIds: partIds.length ? partIds : undefined,
    pageNumber: page,
    pageSize: 12,
  });

  const posts = postsResponse?.items || [];
  const totalPages = postsResponse?.totalPages || 1;
  const totalCount = postsResponse?.totalCount || 0;

  const handleFilterChange = (name: string, value: any) => {
    const params = new URLSearchParams(searchParams.toString());

    if (name === 'category' || name === 'blogCategoryId') {
      if (value) params.set('category', value);
      else params.delete('category');
    } else if (name === 'title') {
      if (value) params.set('q', value);
      else params.delete('q');
    } else if (name === 'carTypeIds') {
      params.delete('carTypeIds');
      if (Array.isArray(value)) value.forEach((v) => params.append('carTypeIds', v));
    } else if (name === 'partIds') {
      params.delete('partIds');
      if (Array.isArray(value)) value.forEach((v) => params.append('partIds', v));
    }

    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  };

  const handleClearAll = () => router.push('/blog');

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/blog?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    carTypeIds.length +
    partIds.length +
    (selectedTitle ? 1 : 0);

  // بررسی مقاله شاخص سردبیر (تنها در صفحه اول و در صورت نبود فیلترهای محدودکننده)
  const showFeaturedHero = page === 1 && !selectedTitle && posts.length > 0;
  const featuredPost = showFeaturedHero ? posts[0] : null;
  const regularPosts = showFeaturedHero ? posts.slice(1) : posts;

  const breadcrumbItems = [{ id: 'blog-root', title: 'دانشنامه و مقالات تخصصی' }];

  return (
    <main className="flex w-full flex-col gap-6 pb-16 sm:gap-8" dir="rtl">
      
      {/* بردکرامپ مسیر جاری */}
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      {/* ================= 1. هدر تحریریه‌ای ژورنال (Editorial Masthead) ================= */}
      <header className="flex flex-col items-start gap-3 border-b border-border/80 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-primary uppercase">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>پایگاه دانش فنی و تخصصی خودرو</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.2]">
          دانشنامه جامع قطعات خودرو و مقالات یدکچی
        </h1>

        <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
          بررسی‌های تخصصی، راهنمای خرید و تحلیل عیب‌یابی انواع قطعات اتومبیل بر اساس استانداردهای مهندسی روز — نگارش‌شده توسط متخصصین و کارشناسان ارشد خودرو.
        </p>
      </header>

      {/* ================= 2. روبان افقی دسته‌بندی‌ها + دکمه فیلتر ================= */}
      <section className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
        {/* دسته‌های اسکرول‌شونده به صورت قرص (Pill Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => handleFilterChange('category', undefined)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-2xs',
              !selectedCategory
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            همه موضوعات
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleFilterChange('category', cat.id)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {cat.title}
              </button>
            );
          })}
        </div>

        {/* دکمه باز کردن فیلترها */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs transition-all hover:bg-muted',
              activeFiltersCount > 0 && 'border-primary/50 text-primary'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>فیلترها</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* ================= 3. مقاله برگزیده سردبیر (Featured Editor’s Pick) ================= */}
      {showFeaturedHero && featuredPost && (
        <section aria-label="مقاله ویژه سردبیر" className="w-full">
          <Link
            href={`/blog/${encodeURIComponent(featuredPost.englishTitle)}`}
            className="group relative flex w-full flex-col overflow-hidden rounded-[24px] border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 aspect-[4/3] sm:aspect-[16/7]"
          >
            {/* تصویر پس‌زمینه با افکت مقیاس */}
            <div className="absolute inset-0">
              <Image
                src={getFullUrl(featuredPost.imageUrl)}
                alt={featuredPost.imageAlt || featuredPost.title}
                fill
                priority
                className="object-cover object-center transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
              />
              {/* گرادیان سینمایی عمیق برای خوانایی متن */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/20" />
            </div>

            {/* محتوای درون کارت ویژه */}
            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 md:p-10 text-white">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-3 py-1 text-2xs font-black tracking-wider text-amber-950 shadow-md">
                  <Sparkles className="h-3 w-3 fill-amber-950 text-amber-950" />
                  <span>برگزیده سردبیر · تحلیل عمیق</span>
                </span>
                <span className="rounded-full bg-black/40 px-3 py-0.5 text-3xs font-bold text-stone-300 backdrop-blur-md">
                  {featuredPost.category?.title || 'فنی'}
                </span>
              </div>

              <div className="max-w-3xl space-y-2.5">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black leading-tight text-white transition-colors group-hover:text-blue-200">
                  {featuredPost.title}
                </h2>
                
                {/* اطلاعات تکمیلی و نویسنده */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-300">
                  <span className="font-bold text-white">{featuredPost.authorName}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>{toPersianDigits(featuredPost.readTime)} دقیقه زمان مطالعه</span>
                  </span>
                  <span>·</span>
                  <span className="text-stone-300 hidden sm:inline">آزمایش فنی و بنچ‌مارک تایید شده</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ================= 4. بدنه اصلی مقالات و سایدبار ================= */}
      <div className="flex w-full items-start gap-8">
        
        {/* سایدبار ثابت در دسکتاپ */}
        <aside className="sticky top-28 hidden w-72 shrink-0 lg:block xl:w-80">
          <BlogSidebar
            categories={categories}
            availableFilters={availableFilters}
            selectedCategory={selectedCategory}
            selectedCarTypes={carTypeIds}
            selectedParts={partIds}
            searchQuery={selectedTitle}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />
        </aside>

        {/* لیست شبکه مقالات */}
        <section className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <h2 className="text-base font-bold text-foreground">
              {showFeaturedHero ? 'سایر مقالات تخصصی' : 'فهرست مقالات منتشر شده'}
            </h2>
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-2xs font-bold text-muted-foreground">
              {toPersianDigits(totalCount)} مقاله
            </span>
          </div>

          {/* حالت لودینگ اسکلتون */}
          {isPostsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : regularPosts.length > 0 ? (
            <>
              {/* شبکه کارت‌های استاندارد */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {regularPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* صفحه‌بندی مینیمال */}
              {totalPages > 1 && (
                <div className="pt-8">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          ) : (
            /* وضعیت خالی بدون محتوا (Empty State ژورنالی) */
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/80 bg-card py-16 px-4 text-center shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground/50">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                مقاله‌ای مطابق با فیلترهای انتخابی یافت نشد
              </h3>
              <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
                عبارت جستجو یا دسته‌بندی را تغییر داده یا فیلترها را ریست کنید تا آرشیو کامل فنی را مشاهده نمایید.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>حذف تمام فیلترها</span>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* مودال فیلترها در موبایل و تبلت (کارت وسط‌چین با ظاهر منسجم) */}
      <Modal isOpen={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} className="max-w-md w-full rounded-2xl">
        <ModalHeader onClose={() => setIsMobileFiltersOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-primary" />
            <span>فیلتر و دسته‌بندی مقالات</span>
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="max-h-[75vh] overflow-y-auto p-4 sm:p-5">
          <BlogSidebar
            categories={categories}
            availableFilters={availableFilters}
            selectedCategory={selectedCategory}
            selectedCarTypes={carTypeIds}
            selectedParts={partIds}
            searchQuery={selectedTitle}
            onFilterChange={(name, val) => {
              handleFilterChange(name, val);
              setIsMobileFiltersOpen(false);
            }}
            onClearAll={() => {
              handleClearAll();
              setIsMobileFiltersOpen(false);
            }}
            isMobile
          />
        </ModalBody>
      </Modal>

    </main>
  );
}