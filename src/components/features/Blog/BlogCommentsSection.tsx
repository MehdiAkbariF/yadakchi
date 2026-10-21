'use client';

import * as React from 'react';
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

export interface BlogCommentsSectionProps {
  blogPostId: string;
}

export function BlogCommentsSection({ blogPostId }: BlogCommentsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = React.useState(1);

  const { data: commentsResponse, isLoading } = useGetBlogPostComments(blogPostId, page);
  const createComment = useCreateBlogPostComment();

  const comments = commentsResponse?.items || [];
  const totalPages = commentsResponse?.totalPages || 1;
  const totalCount = commentsResponse?.totalCount || 0;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBlogPostCommentRequest>({
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
      reset({ blogPostId, comment: '', isIncognito: false });
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در ثبت دیدگاه. لطفاً مجدداً تلاش کنید.');
    }
  };

  return (
    <section
      aria-labelledby="comments-heading"
      className="mt-6 flex w-full flex-col gap-6 border-t border-dashed border-border pt-8"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
          <h2 id="comments-heading" className="text-lg font-bold text-foreground">
            دیدگاه‌ها و نظرات کاربران
          </h2>
        </div>
        <span className="rounded-sm bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
          {toPersianDigits(totalCount)} نظر
        </span>
      </div>

      <div className="w-full rounded-lg border border-border bg-card p-4 shadow-xs sm:p-6">
        <h3 className="mb-1 text-sm font-bold text-foreground">
          دیدگاه یا پرسش خود را درباره این مقاله بنویسید
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          دیدگاه شما پس از تایید مدیریت در سایت نمایش داده خواهد شد.
        </p>

        <form onSubmit={handleSubmit(onCommentSubmit)} className="flex flex-col gap-3.5">
          <TextArea
            placeholder="متن دیدگاه خود را بنویسید..."
            rows={4}
            error={errors.comment?.message}
            className="text-sm leading-relaxed"
            {...register('comment')}
          />

          <div className="flex flex-col justify-between gap-4 pt-1 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer select-none items-center gap-2">
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
              className="inline-flex h-10 items-center justify-center gap-2 px-6 text-xs font-bold shadow-xs self-start sm:self-auto"
            >
              <Send aria-hidden="true" className="h-3.5 w-3.5 rtl:-scale-x-100" />
              <span>ارسال دیدگاه</span>
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse space-y-3 rounded-lg border border-border bg-card p-4 sm:p-5"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="h-3 w-24 rounded-sm bg-muted" />
                  </div>
                  <div className="h-3 w-16 rounded-sm bg-muted" />
                </div>
                <div className="h-3 w-full rounded-sm bg-muted" />
                <div className="h-3 w-2/3 rounded-sm bg-muted" />
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <>
            <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
              {comments.map((c) => (
                <li key={c.id}>
                  <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-xs sm:p-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                          <User aria-hidden="true" className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{c.creatorName}</span>
                      </div>
                      <time className="text-2xs font-medium text-muted-foreground">
                        {c.createDateFormatted}
                      </time>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-reading text-foreground/90">
                      {c.comment}
                    </p>
                  </article>
                </li>
              ))}
            </ol>

            {totalPages > 1 ? (
              <div className="pt-2">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-12 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <MessageSquare aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">
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