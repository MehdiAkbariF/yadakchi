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

  const { data: categories = [], isLoading: isCategoriesLoading } = useGetBlogCategories();
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

    if (name === 'category') {
      if (value) params.set('category', value);
      else params.delete('category');
    } else if (name === 'title') {
      if (value) params.set('q', value);
      else params.delete('q');
    } else if (name === 'blogCategoryId') {
      if (value) params.set('category', value);
      else params.delete('category');
    } else if (name === 'carTypeIds') {
      params.delete('carTypeIds');
      if (Array.isArray(value)) {
        value.forEach((v) => params.append('carTypeIds', v));
      }
    } else if (name === 'partIds') {
      params.delete('partIds');
      if (Array.isArray(value)) {
        value.forEach((v) => params.append('partIds', v));
      }
    }

    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  };

  const handleClearAll = () => {
    router.push('/blog');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/blog?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbItems = [
    { id: 'blog-root', title: 'مجله تخصصی یدک‌چی' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-right select-none" dir="rtl">
      
      <Breadcrumb items={breadcrumbItems} />

      {/* بنر هدر مجله */}
      <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 rounded-2xl p-6 sm:p-8 flex items-center justify-between relative overflow-hidden">
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2 text-primary font-black">
            <BookOpen className="h-5 w-5 shrink-0" />
            <span className="text-xs sm:text-sm font-black font-iran-yekan">مجله تخصصی خودرو و قطعات یدکی</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground font-iran-yekan mt-1">
            دانشنامه فنی و اخبار دنیای قطعات یدک‌چی
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-iran-yekan max-w-xl leading-relaxed mt-1">
            راهنمای جامع خرید، معرفی و عیب‌یابی قطعات انواع خودروهای ایرانی و وارداتی به قلم کارشناسان خبره
          </p>
        </div>
      </div>

      {/* کنترلر موبایل فیلترها */}
      <div className="lg:hidden flex items-center justify-between border-b pb-3 pt-1">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center justify-center gap-2 border rounded-xl py-2.5 px-4 bg-background text-xs font-bold font-iran-yekan text-foreground shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>فیلتر و دسته‌بندی‌ها</span>
        </button>

        <span className="text-xs font-bold text-muted-foreground font-iran-yekan bg-muted px-3 py-1.5 rounded-xl">
          {toPersianDigits(totalCount)} مقاله
        </span>
      </div>

      {/* محتوای گرید و سایدبار */}
      <div className="w-full flex items-start gap-8">
        
        {/* سایدبار دسکتاپ */}
        <div className="hidden lg:block w-[300px] shrink-0 sticky top-[132px]">
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
        </div>

        {/* لیست مقالات */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          <div className="hidden lg:flex items-center justify-between border-b pb-3">
            <span className="text-sm font-black text-foreground font-iran-yekan">آخرین مطالب منتشر شده</span>
            <span className="text-xs font-bold text-muted-foreground font-iran-yekan bg-muted px-3 py-1 rounded-lg">
              {toPersianDigits(totalCount)} مقاله تخصصی
            </span>
          </div>

          {isPostsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed gap-3">
              <Inbox className="h-12 w-12 text-muted-foreground/50 stroke-[1.5]" />
              <span className="text-sm font-bold font-iran-yekan text-foreground">مقاله‌ای با این مشخصات یافت نشد</span>
              <p className="text-xs text-muted-foreground font-iran-yekan">لطفاً فیلترها را تغییر دهید یا عبارت دیگری را جستجو نمایید.</p>
            </div>
          )}

        </div>

      </div>

      {/* مودال فیلترهای موبایل */}
      <Modal isOpen={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsMobileFiltersOpen(false)}>
          <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            فیلتر مقالات
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="p-5 pt-4 text-right">
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

    </div>
  );
}

