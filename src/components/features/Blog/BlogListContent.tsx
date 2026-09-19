// src/components/features/Blog/BlogListContent.tsx

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, SlidersHorizontal, Inbox } from 'lucide-react';
import { useGetBlogCategories, useGetBlogPosts, useGetBlogPostFilters } from '@/domains/blog/hooks/blog.hooks';
import { BlogCard } from './BlogCard';
import { BlogCardSkeleton } from './BlogCardSkeleton';
import { BlogSidebar } from './BlogSidebar';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { toPersianDigits } from '@/core/utils/formatters';

export function BlogListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  const breadcrumbItems = [{ id: 'blog-root', title: 'مجله تخصصی یدک‌چی' }];

  return (
    <main className="w-full flex flex-col gap-6 sm:gap-8 pb-12" dir="rtl">
      
      {/* ناوبری مسیر (Breadcrumb) */}
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      {/* بنر هدر مجله: بهینه‌سازی شده در موبایل با پدینگ و تایپوگرافی تطبیقی */}
      <header className="relative w-full rounded-2xl sm:rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 sm:p-8 md:p-10 overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col items-start gap-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="text-xs font-bold">مجله خودرو و قطعات یدکی</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-foreground tracking-tight mt-1 leading-tight sm:leading-snug">
            دانشنامه فنی و اخبار دنیای قطعات یدک‌چی
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed mt-1">
            راهنمای جامع خرید، معرفی و عیب‌یابی قطعات انواع خودروها به قلم کارشناسان خبره
          </p>
        </div>

        {/* پترن پس‌زمینه برای جلوه بصری */}
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </header>

      {/* کنترلر و اکشن‌بار موبایل */}
      <div className="lg:hidden flex items-center justify-between gap-3 p-1">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-input bg-background shadow-xs text-xs font-bold text-foreground hover:bg-accent active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
          <span>فیلتر و دسته‌بندی‌ها</span>
        </button>

        <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-3 py-2 rounded-xl border border-border/40">
          {toPersianDigits(totalCount)} مقاله
        </span>
      </div>

      {/* چیدمان اصلی ۲ ستونه */}
      <div className="w-full flex items-start gap-8">
        
        {/* سایدبار فیلترها (دسکتاپ) */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28">
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

        {/* گرید مقالات و وضعیت‌ها */}
        <section className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* هدر بالایی لیست در دسکتاپ */}
          <div className="hidden lg:flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-base font-bold text-foreground">آخرین مطالب منتشر شده</h2>
            <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border/30">
              {toPersianDigits(totalCount)} مقاله تخصصی
            </span>
          </div>

          {isPostsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            /* حالت خالی (Empty State) مهندسی شده */
            <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center bg-card rounded-2xl border border-dashed border-border/80 gap-3">
              <div className="p-3 bg-muted rounded-full">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">مقاله‌ای با این مشخصات یافت نشد</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                لطفاً کلمات کلیدی دیگری را جستجو کنید یا فیلترهای فعال را پاک نمایید.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="mt-2 text-xs font-bold text-primary hover:underline"
              >
                پاک کردن همه فیلترها
              </button>
            </div>
          )}

        </section>

      </div>

      {/* مودال فیلتر موبایل */}
      <Modal isOpen={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsMobileFiltersOpen(false)}>
          <ModalTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            فیلتر مقالات
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto">
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