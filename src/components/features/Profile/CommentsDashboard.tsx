'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  ArrowRight,
  Star,
  Clock,
  Trash2,
  Pencil,
  Plus,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  useGetPendingComments,
  useGetUserComments,
  useDeleteComment,
} from '@/domains/front/comment/hooks/comment.hooks';
import { useGetUserInquiries, useDeleteInquiry } from '@/domains/front/inquiry/hooks/inquiry.hooks';
import { useGetUserBlogPostComments } from '@/domains/blog/hooks/blog.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { WriteCommentModal } from './components/WriteCommentModal';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { getFullUrl } from '@/core/utils/formatters';

const TABS = [
  { key: 'pending' as const, label: 'در انتظار نظر', icon: Clock },
  { key: 'comments' as const, label: 'نظرات محصولات', icon: MessageSquare },
  { key: 'inquiries' as const, label: 'پرسش‌ها', icon: Search },
  { key: 'blogComments' as const, label: 'نظرات بلاگ', icon: BookOpen },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function CommentsDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<TabKey>('pending');
  const [pendingPage, setPendingPage] = React.useState(1);
  const [commentsPage, setCommentsPage] = React.useState(1);
  const [inquiriesPage, setInquiriesPage] = React.useState(1);
  const [blogCommentsPage, setBlogCommentsPage] = React.useState(1);

  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(null);
  const [editingComment, setEditingComment] = React.useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: pendingResponse, isLoading: isPendingLoading } = useGetPendingComments(pendingPage, 10);
  const { data: commentsResponse, isLoading: isCommentsLoading } = useGetUserComments(commentsPage, 10);
  const { data: inquiriesResponse, isLoading: isInquiriesLoading } = useGetUserInquiries(inquiriesPage, 10);
  const { data: blogCommentsResponse, isLoading: isBlogCommentsLoading } = useGetUserBlogPostComments(blogCommentsPage, 10);

  const deleteComment = useDeleteComment();
  const deleteInquiry = useDeleteInquiry();

  const pendingItems = pendingResponse?.items || [];
  const pendingTotalPages = pendingResponse?.totalPages || 1;
  const pendingCount = pendingResponse?.totalCount || 0;

  const commentItems = commentsResponse?.items || [];
  const commentsTotalPages = commentsResponse?.totalPages || 1;
  const commentsCount = commentsResponse?.totalCount || 0;

  const inquiryItems = inquiriesResponse?.items || [];
  const inquiriesTotalPages = inquiriesResponse?.totalPages || 1;
  const inquiriesCount = inquiriesResponse?.totalCount || 0;

  const blogCommentItems = blogCommentsResponse?.items || [];
  const blogCommentsTotalPages = blogCommentsResponse?.totalPages || 1;
  const blogCommentsCount = blogCommentsResponse?.totalCount || 0;

  const counts: Record<TabKey, number> = {
    pending: pendingCount,
    comments: commentsCount,
    inquiries: inquiriesCount,
    blogComments: blogCommentsCount,
  };

  const handleOpenWriteComment = (product: any) => {
    setSelectedProduct(product);
    setEditingComment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditComment = (comment: any) => {
    setSelectedProduct({
      productId: comment.productId,
      productTitle: comment.productTitle,
      productImage: comment.productImage,
    });
    setEditingComment(comment);
    setIsModalOpen(true);
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment.mutateAsync(id);
      showToast.success('نظر شما با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['user', 'comments'] });
    } catch {}
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await deleteInquiry.mutateAsync(id);
      showToast.success('پرسش شما با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['user', 'inquiries'] });
    } catch {}
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-6 select-none">
      <div className="mb-1 flex items-center gap-3 border-b border-border pb-3 lg:hidden">
        <button
          type="button"
          onClick={() => router.push('/profile')}
          aria-label="بازگشت"
          className="-me-1 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
        >
          <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground">نظرات و پرسش‌ها</span>
      </div>

      <div className="flex w-full flex-col gap-2 border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <MessageSquare aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-xl font-bold text-foreground">نظرات و پرسش‌ها</span>
        </div>
        <p className="text-xs text-muted-foreground">
          مدیریت نظرات محصولات، پرسش‌های ثبت‌شده در بخش پرسش و پاسخ، و نظرات وبلاگ
        </p>
      </div>

      <div className="flex w-full shrink-0 select-none items-center gap-4 overflow-x-auto px-1 py-2 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={isActive}
              className={cn(
                'flex h-24 w-32 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border bg-card px-3 text-center outline-none shadow-xs transition-colors duration-fast md:h-24 md:w-36',
                isActive
                  ? 'border-primary bg-accent font-bold text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <TabIcon
                aria-hidden="true"
                className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
              />
              <span className="text-xs font-bold">{tab.label}</span>
              <span
                className={cn(
                  'mt-0.5 rounded-full px-2 py-0.5 text-2xs font-bold',
                  isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'pending' ? (
        <div className="flex w-full flex-col gap-5">
          {isPendingLoading ? (
            <PageLoading label="در حال بارگذاری کالاها..." />
          ) : pendingItems.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {pendingItems.map((item: any) => (
                  <Card
                    key={item.productId}
                    className="flex w-full flex-col items-stretch justify-between gap-4 p-5 transition-colors hover:border-primary/40 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted p-0.5">
                        <img src={getFullUrl(item.productImage)} className="h-full w-full object-contain" alt="" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="block truncate text-sm font-bold text-foreground">{item.productTitle}</span>
                        <span className="block text-2xs text-muted-foreground">
                          خریداری شده از فروشگاه {item.shopTitle}
                        </span>
                        <span className="mt-1 block text-2xs text-muted-foreground/80">
                          تاریخ خرید: {item.lastSaleDateFormatted}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenWriteComment(item)}
                      className="h-9 shrink-0 px-4 text-2xs font-bold shadow-xs"
                    >
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      <span>ثبت نظر و امتیاز</span>
                    </Button>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={pendingPage}
                totalPages={pendingTotalPages}
                onPageChange={(p) => setPendingPage(p)}
              />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card py-16 text-center">
              <Clock aria-hidden="true" className="h-10 w-10 text-muted-foreground/60" />
              <span className="text-xs font-bold text-muted-foreground">کالایی در انتظار نظر شما وجود ندارد.</span>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'comments' ? (
        <div className="flex w-full flex-col gap-5">
          {isCommentsLoading ? (
            <PageLoading label="در حال بارگذاری نظرات..." />
          ) : commentItems.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {commentItems.map((comment: any) => (
                  <Card key={comment.id} className="flex w-full flex-col justify-between gap-4 p-5">
                    <div className="flex w-full items-center gap-3.5 border-b border-border pb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted p-0.5">
                        <img src={getFullUrl(comment.productImage)} className="h-full w-full object-contain" alt="" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-foreground">{comment.productTitle}</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-2xs font-bold',
                              comment.isConfirmed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            )}
                          >
                            {comment.isConfirmed ? 'تایید شده' : 'در حال بررسی'}
                          </span>
                          <span className="text-2xs text-muted-foreground/80">{comment.createDateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            aria-hidden="true"
                            className={cn(
                              'h-3.5 w-3.5 shrink-0',
                              i < comment.rate ? 'fill-warning text-warning' : 'text-border'
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1 break-words text-sm leading-relaxed text-foreground">{comment.comment}</p>
                    </div>

                    <div className="mt-1.5 flex items-center justify-end gap-2.5 border-t border-dashed border-border pt-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEditComment(comment)}
                        aria-label="ویرایش"
                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary"
                      >
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteComment.isPending}
                        aria-label="حذف"
                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={commentsPage}
                totalPages={commentsTotalPages}
                onPageChange={(p) => setCommentsPage(p)}
              />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card py-16 text-center">
              <MessageSquare aria-hidden="true" className="h-10 w-10 text-muted-foreground/60" />
              <span className="text-xs font-bold text-muted-foreground">هنوز نظری ثبت نکرده‌اید.</span>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'inquiries' ? (
        <div className="flex w-full flex-col gap-5">
          {isInquiriesLoading ? (
            <PageLoading label="در حال بارگذاری پرسش‌ها..." />
          ) : inquiryItems.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {inquiryItems.map((inquiry: any) => (
                  <Card key={inquiry.id} className="flex w-full flex-col justify-between gap-4 p-5">
                    <div className="flex w-full items-center gap-3.5 border-b border-border pb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted p-0.5">
                        <img src={getFullUrl(inquiry.productImage)} className="h-full w-full object-contain" alt="" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-foreground">{inquiry.productTitle}</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-2xs font-bold',
                              inquiry.isConfirmed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            )}
                          >
                            {inquiry.isConfirmed ? 'تایید شده' : 'در حال بررسی'}
                          </span>
                          <span className="text-2xs text-muted-foreground/80">{inquiry.createDateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-2xs font-bold text-primary">متن پرسش:</span>
                      <p className="break-words text-sm leading-relaxed text-foreground">{inquiry.comment}</p>
                      <span className="mt-1.5 text-2xs font-bold text-muted-foreground">
                        {inquiry.replyCount} پاسخ ثبت شده
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-end border-t border-dashed border-border pt-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                        disabled={deleteInquiry.isPending}
                        aria-label="حذف"
                        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={inquiriesPage}
                totalPages={inquiriesTotalPages}
                onPageChange={(p) => setInquiriesPage(p)}
              />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card py-16 text-center">
              <Search aria-hidden="true" className="h-10 w-10 text-muted-foreground/60" />
              <span className="text-xs font-bold text-muted-foreground">هنوز پرسشی ثبت نکرده‌اید.</span>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'blogComments' ? (
        <div className="flex w-full flex-col gap-5">
          {isBlogCommentsLoading ? (
            <PageLoading label="در حال بارگذاری نظرات بلاگ..." />
          ) : blogCommentItems.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {blogCommentItems.map((comment: any) => (
                  <Card key={comment.id} className="flex w-full flex-col justify-between gap-4 p-5">
                    <div className="flex w-full items-center gap-3.5 border-b border-border pb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-accent bg-accent p-0.5 text-primary">
                        <BookOpen aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={comment.blogPostEnglishTitle ? `/blog/${encodeURIComponent(comment.blogPostEnglishTitle)}` : '/blog'}
                          className="block truncate text-xs font-bold text-foreground transition-colors hover:text-primary"
                        >
                          {comment.blogPostTitle}
                        </Link>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-2xs font-bold',
                              comment.isConfirmed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            )}
                          >
                            {comment.isConfirmed ? 'تایید شده' : 'در حال بررسی'}
                          </span>
                          <span className="text-2xs text-muted-foreground/80">{comment.createDateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-2xs font-bold text-primary">متن دیدگاه:</span>
                      <p className="break-words text-sm leading-relaxed text-foreground">{comment.comment}</p>
                    </div>

                    <div className="mt-1.5 flex items-center justify-end border-t border-dashed border-border pt-3">
                      <Link
                        href={comment.blogPostEnglishTitle ? `/blog/${encodeURIComponent(comment.blogPostEnglishTitle)}` : '/blog'}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <span>مشاهده مقاله</span>
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={blogCommentsPage}
                totalPages={blogCommentsTotalPages}
                onPageChange={(p) => setBlogCommentsPage(p)}
              />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card py-16 text-center">
              <BookOpen aria-hidden="true" className="h-10 w-10 text-muted-foreground/60" />
              <span className="text-xs font-bold text-muted-foreground">هنوز دیدگاهی برای مقالات ثبت نکرده‌اید.</span>
            </div>
          )}
        </div>
      ) : null}

      <WriteCommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        editingComment={editingComment}
      />
    </div>
  );
}