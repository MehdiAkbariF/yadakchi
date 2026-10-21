'use client';

import * as React from 'react';
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

  const breadcrumbItems = [{ id: 'blog-root', title: 'مجله تخصصی یدک‌چی' }];

  return (
    <main className="flex w-full flex-col gap-6 pb-12 sm:gap-8">
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      <header className="relative w-full overflow-hidden rounded-lg border border-accent bg-muted/50 p-5 shadow-xs sm:p-8 md:p-10">
        <div className="relative z-10 flex max-w-3xl flex-col items-start gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-primary">
            <BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="text-xs font-bold">مجله خودرو و قطعات یدکی</span>
          </div>

          <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            دانشنامه فنی و اخبار دنیای قطعات یدک‌چی
          </h1>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:text-base">
            راهنمای جامع خرید، معرفی و عیب‌یابی قطعات انواع خودروها به قلم کارشناسان خبره
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -start-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
        />
      </header>

      <div className="flex items-center justify-between gap-3 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-card px-4 text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
          <span>فیلتر و دسته‌بندی‌ها</span>
        </button>

        <span className="rounded-md border border-border bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
          {toPersianDigits(totalCount)} مقاله
        </span>
      </div>

      <div className="flex w-full items-start gap-8">
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

        <section className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="hidden items-center justify-between border-b border-border pb-3 lg:flex">
            <h2 className="text-base font-bold text-foreground">آخرین مطالب منتشر شده</h2>
            <span className="rounded-sm border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
              {toPersianDigits(totalCount)} مقاله تخصصی
            </span>
          </div>

          {isPostsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="pt-6">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card p-8 text-center sm:p-14">
              <div className="rounded-full bg-muted p-3">
                <Inbox aria-hidden="true" className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground sm:text-base">
                مقاله‌ای با این مشخصات یافت نشد
              </h3>
              <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">
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

      <Modal isOpen={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsMobileFiltersOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-primary" />
            فیلتر مقالات
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
