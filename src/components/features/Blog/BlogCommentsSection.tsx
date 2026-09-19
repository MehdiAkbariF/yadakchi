// src/components/features/Blog/components/BlogCommentsSection.tsx

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, User, Send } from 'lucide-react';
import { useGetBlogPostComments, useCreateBlogPostComment } from '@/domains/blog/hooks/blog.hooks';
import { blogValidators } from '@/domains/blog/validation/blog.validation';
import { CreateBlogPostCommentRequest } from '@/domains/blog/types/view.types';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Button } from '@/components/primitives/Button/Button';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { showToast } from '@/core/utils/toast';
import { toPersianDigits } from '@/core/utils/formatters';

interface BlogCommentsSectionProps {
  blogPostId: string;
}

export function BlogCommentsSection({ blogPostId }: BlogCommentsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);

  const { data: commentsResponse, isLoading } = useGetBlogPostComments(blogPostId, page);
  const createComment = useCreateBlogPostComment();

  const comments = commentsResponse?.items || [];
  const totalPages = commentsResponse?.totalPages || 1;
  const totalCount = commentsResponse?.totalCount || 0;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CreateBlogPostCommentRequest>({
    resolver: zodResolver(blogValidators.createComment.getSchema() as any),
    defaultValues: {
      blogPostId,
      comment: '',
      isIncognito: false,
    },
  });

  const watchIncognito = watch('isIncognito');

  const onCommentSubmit = async (data: CreateBlogPostCommentRequest) => {
    if (!isAuthenticated) {
      showToast.error('برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      await createComment.mutateAsync(data);
      showToast.success('دیدگاه شما ثبت شد و پس از بازبینی منتشر خواهد شد');
      reset({
        blogPostId,
        comment: '',
        isIncognito: false,
      });
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در ثبت دیدگاه. لطفاً مجدداً تلاش کنید.');
    }
  };

  return (
    <section aria-labelledby="comments-heading" className="w-full flex flex-col gap-6 border-t border-dashed border-border/80 pt-8 mt-6">
      
      {/* عنوان بخش نظرات */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary shrink-0" />
          <h2 id="comments-heading" className="text-base sm:text-lg font-black text-foreground">
            دیدگاه‌ها و نظرات کاربران
          </h2>
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
          {toPersianDigits(totalCount)} نظر
        </span>
      </div>

      {/* فرم ثبت دیدگاه جدید */}
      <div className="w-full bg-card border border-border/70 rounded-2xl p-4 sm:p-6 shadow-2xs">
        <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">
          دیدگاه یا پرسش خود را درباره این مقاله بنویسید
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          دیدگاه شما پس از تایید مدیریت در سایت نمایش داده خواهد شد.
        </p>

        <form onSubmit={handleSubmit(onCommentSubmit)} className="flex flex-col gap-3.5">
          <TextArea
            placeholder="متن دیدگاه خود را بنویسید..."
            rows={4}
            error={errors.comment?.message}
            className="text-xs sm:text-sm leading-relaxed"
            {...register('comment')}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* چک‌باکس با رویکرد ارگونومیک (برچسب قابل لمس و کلیک) */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={watchIncognito}
                onChange={(checked) => setValue('isIncognito', checked)}
              />
              <span className="text-xs font-medium text-foreground">
                ارسال دیدگاه به صورت ناشناس
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createComment.isPending}
              className="h-10 px-6 rounded-xl text-xs font-bold shadow-xs inline-flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95 transition-transform"
            >
              {/* آیکون Send بدون باگ برعکس‌شدن عمودی؛ اصلاح شده برای RTL */}
              <Send className="h-3.5 w-3.5 rtl:-scale-x-100" />
              <span>ارسال دیدگاه</span>
            </Button>
          </div>
        </form>
      </div>

      {/* لیست دیدگاه‌ها */}
      <div className="flex flex-col gap-4 mt-2">
        {isLoading ? (
          /* اسکلتون لودینگ برای جلوگیری از پرش چیدمان */
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 sm:p-5 border border-border/50 rounded-2xl bg-card space-y-3 animate-pulse">
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="w-24 h-3 bg-muted rounded-md" />
                  </div>
                  <div className="w-16 h-3 bg-muted rounded-md" />
                </div>
                <div className="w-full h-3 bg-muted rounded-md" />
                <div className="w-2/3 h-3 bg-muted rounded-md" />
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <>
            <ol className="flex flex-col gap-3.5 list-none p-0 m-0">
              {comments.map((c) => (
                <li key={c.id}>
                  <article className="p-4 sm:p-5 border border-border/60 rounded-2xl bg-card flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {c.creatorName}
                        </span>
                      </div>
                      <time className="text-[11px] text-muted-foreground font-medium">
                        {c.createDateFormatted}
                      </time>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-loose whitespace-pre-wrap">
                      {c.comment}
                    </p>
                  </article>
                </li>
              ))}
            </ol>

            {totalPages > 1 && (
              <div className="pt-2">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="w-full py-12 text-center border border-dashed border-border/80 rounded-2xl bg-card flex flex-col items-center justify-center gap-2 px-4">
            <div className="p-3 bg-muted rounded-full text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-foreground mt-1">
              هنوز دیدگاهی برای این مقاله ثبت نشده است
            </p>
            <span className="text-xs text-muted-foreground">
              اولین نفری باشید که تجربه یا نظر خود را به اشتراک می‌گذارد.
            </span>
          </div>
        )}
      </div>

    </section>
  );
}