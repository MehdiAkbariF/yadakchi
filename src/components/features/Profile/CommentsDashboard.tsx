'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useGetPendingComments, 
  useGetUserComments, 
  useDeleteComment 
} from '@/domains/front/comment/hooks/comment.hooks';
import { 
  useGetUserInquiries, 
  useDeleteInquiry 
} from '@/domains/front/inquiry/hooks/inquiry.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { WriteCommentModal } from './components/WriteCommentModal';
import { 
  MessageSquare, 
  ArrowRight, 
  Star, 
  Clock, 
  Trash2, 
  Pencil, 
  Plus,
  Search
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

export function CommentsDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'pending' | 'comments' | 'inquiries'>('pending');
  const [pendingPage, setPendingPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [inquiriesPage, setInquiriesPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editingComment, setEditingComment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: pendingResponse, isLoading: isPendingLoading } = useGetPendingComments(pendingPage, 10);
  const { data: commentsResponse, isLoading: isCommentsLoading } = useGetUserComments(commentsPage, 10);
  const { data: inquiriesResponse, isLoading: isInquiriesLoading } = useGetUserInquiries(inquiriesPage, 10);

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

  const isPendingActive = activeTab === 'pending';
  const isCommentsActive = activeTab === 'comments';
  const isInquiriesActive = activeTab === 'inquiries';

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
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
    } catch (error) {}
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await deleteInquiry.mutateAsync(id);
      showToast.success('پرسش شما با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['user', 'inquiries'] });
    } catch (error) {}
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center gap-3 border-b pb-3 mb-1 shrink-0">
        <button 
          onClick={() => router.push('/profile')}
          className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
          aria-label="Back"
        >
          <ArrowRight className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-bold font-iran-yekan text-foreground">نظرات و پرسش‌ها</span>
      </div>

      <div className="w-full flex flex-col gap-2 border-b pb-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary shrink-0" />
          <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">نظرات و پرسش‌ها</span>
        </div>
        <p className="text-xs text-muted-foreground font-iran-yekan">
          مدیریت نظرات، امتیازها و پرسش‌های ثبت‌شده در مورد محصولات مختلف
        </p>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 w-full shrink-0 select-none px-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "w-32 h-24 md:w-40 md:h-26 shrink-0 flex flex-col items-center justify-center gap-2 border rounded-2xl bg-background transition-all outline-none shadow-sm px-4",
            isPendingActive 
              ? "border-primary bg-primary/5 text-primary scale-105 font-bold" 
              : "border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:border-zinc-300 hover:text-foreground"
          )}
        >
          <Clock className={cn("h-5 w-5 shrink-0", isPendingActive ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[10px] md:text-xs font-bold font-iran-yekan">در انتظار ثبت نظر</span>
          <span className={cn(
            "text-[9px] md:text-[10px] font-bold font-iran-yekan px-2.5 py-0.5 rounded-full mt-1",
            isPendingActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {pendingCount} کالا
          </span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={cn(
            "w-32 h-24 md:w-40 md:h-26 shrink-0 flex flex-col items-center justify-center gap-2 border rounded-2xl bg-background transition-all outline-none shadow-sm px-4",
            isCommentsActive 
              ? "border-primary bg-primary/5 text-primary scale-105 font-bold" 
              : "border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:border-zinc-300 hover:text-foreground"
          )}
        >
          <MessageSquare className={cn("h-5 w-5 shrink-0", isCommentsActive ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[10px] md:text-xs font-bold font-iran-yekan">نظرات من</span>
          <span className={cn(
            "text-[9px] md:text-[10px] font-bold font-iran-yekan px-2.5 py-0.5 rounded-full mt-1",
            isCommentsActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {commentsCount} نظر
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={cn(
            "w-32 h-24 md:w-40 md:h-26 shrink-0 flex flex-col items-center justify-center gap-2 border rounded-2xl bg-background transition-all outline-none shadow-sm px-4",
            isInquiriesActive 
              ? "border-primary bg-primary/5 text-primary scale-105 font-bold" 
              : "border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:border-zinc-300 hover:text-foreground"
          )}
        >
          <Search className={cn("h-5 w-5 shrink-0", isInquiriesActive ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[10px] md:text-xs font-bold font-iran-yekan">پرسش‌های من</span>
          <span className={cn(
            "text-[9px] md:text-[10px] font-bold font-iran-yekan px-2.5 py-0.5 rounded-full mt-1",
            isInquiriesActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {inquiriesCount} پرسش
          </span>
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          {isPendingLoading ? (
            <PageLoading message="در حال دریافت کالاهای منتظر نظر..." />
          ) : pendingItems.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {pendingItems.map((item: any) => (
                  <Card key={item.productId} className="w-full border rounded-xl p-5 bg-background shadow-sm hover:border-primary/25 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-16 h-16 shrink-0 rounded-xl border bg-muted/10 flex items-center justify-center overflow-hidden p-0.5">
                        <img src={getFullUrl(item.productImage)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 text-right flex flex-col gap-1">
                        <span className="text-xs md:text-sm font-bold text-foreground truncate block">{item.productTitle}</span>
                        <span className="text-[10px] text-muted-foreground block">خریداری شده از فروشگاه {item.shopTitle}</span>
                        <span className="text-[9px] text-muted-foreground/80 block mt-1">سفارش در: {item.lastSaleDateFormatted}</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenWriteComment(item)}
                      className="rounded-xl font-iran-yekan font-bold text-[10px] h-9 px-4 shrink-0 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
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
            <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
              <Clock className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
              <span className="text-xs font-bold font-iran-yekan text-muted-foreground">کالای در انتظار نظری یافت نشد.</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          {isCommentsLoading ? (
            <PageLoading message="در حال دریافت نظرات شما..." />
          ) : commentItems.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {commentItems.map((comment: any) => (
                  <Card key={comment.id} className="w-full border rounded-xl p-5 bg-background shadow-sm hover:border-primary/25 transition-all flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-3.5 border-b pb-3 w-full">
                      <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden p-0.5">
                        <img src={getFullUrl(comment.productImage)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <span className="text-xs font-bold text-foreground truncate block">{comment.productTitle}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn(
                            "font-bold text-[9px] px-2 py-0.5 rounded-full",
                            comment.isConfirmed ? "bg-success-50 text-success-600 dark:bg-success-950/20" : "bg-warning-50 text-warning-600 dark:bg-warning-950/20"
                          )}>
                            {comment.isConfirmed ? "تایید شده" : "در انتظار تایید"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/80">{comment.createDateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-3.5 w-3.5 shrink-0", 
                              i < comment.rate ? "fill-yellow-400 text-yellow-400" : "text-zinc-200 dark:text-zinc-800"
                            )} 
                          />
                        ))}
                      </div>
                      <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-iran-yekan break-words mt-1">{comment.comment}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 border-t border-dashed pt-3 mt-1.5">
                      <button
                        onClick={() => handleOpenEditComment(comment)}
                        className="p-1.5 border hover:border-primary/20 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-all"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteComment.isPending}
                        className="p-1.5 border hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
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
            <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
              <MessageSquare className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
              <span className="text-xs font-bold font-iran-yekan text-muted-foreground">هنوز هیچ نظری ثبت نکرده‌اید.</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          {isInquiriesLoading ? (
            <PageLoading message="در حال دریافت پرسش‌های شما..." />
          ) : inquiryItems.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {inquiryItems.map((inquiry: any) => (
                  <Card key={inquiry.id} className="w-full border rounded-xl p-5 bg-background shadow-sm hover:border-primary/25 transition-all flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-3.5 border-b pb-3 w-full">
                      <div className="w-10 h-10 shrink-0 rounded-lg border bg-muted/10 flex items-center justify-center overflow-hidden p-0.5">
                        <img src={getFullUrl(inquiry.productImage)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <span className="text-xs font-bold text-foreground truncate block">{inquiry.productTitle}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn(
                            "font-bold text-[9px] px-2 py-0.5 rounded-full",
                            inquiry.isConfirmed ? "bg-success-50 text-success-600 dark:bg-success-950/20" : "bg-warning-50 text-warning-600 dark:bg-warning-950/20"
                          )}>
                            {inquiry.isConfirmed ? "تایید شده" : "در انتظار تایید"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/80">{inquiry.createDateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-primary">سوال شما:</span>
                      <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-iran-yekan break-words">{inquiry.comment}</p>
                      <span className="text-[10px] text-muted-foreground font-bold mt-1.5">{inquiry.replyCount} پاسخ ثبت شده</span>
                    </div>

                    <div className="flex items-center justify-end border-t border-dashed pt-3 mt-1.5">
                      <button
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                        disabled={deleteInquiry.isPending}
                        className="p-1.5 border hover:border-destructive/20 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
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
            <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
              <Search className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
              <span className="text-xs font-bold font-iran-yekan text-muted-foreground">هنوز هیچ پرسشی ثبت نکرده‌اید.</span>
            </div>
          )}
        </div>
      )}

      <WriteCommentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
        editingComment={editingComment}
      />

    </div>
  );
}