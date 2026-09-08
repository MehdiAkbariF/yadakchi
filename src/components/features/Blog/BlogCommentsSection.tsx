// src/components/features/Blog/components/BlogCommentsSection.tsx

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, User, Send, CheckCircle2, AlertCircle } from 'lucide-react';
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
      showToast.success('دیدگاه شما با موفقیت ثبت شد و پس از بازبینی نمایش داده خواهد شد');
      reset({
        blogPostId,
        comment: '',
        isIncognito: false,
      });
    } catch (err: any) {
      showToast.error(err.userMessage || 'خطا در ثبت دیدگاه. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-right select-none border-t border-dashed pt-8 mt-6" dir="rtl">
      
      {/* عنوان بخش نظرات */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-black text-foreground font-iran-yekan">
            دیدگاه‌ها و نظرات کاربران
          </h3>
        </div>
        <span className="text-xs font-bold text-muted-foreground font-iran-yekan bg-muted px-2.5 py-1 rounded-lg">
          {toPersianDigits(totalCount)} نظر
        </span>
      </div>

      {/* فرم ثبت دیدگاه جدید */}
      <div className="w-full bg-card border rounded-2xl p-5 md:p-6 shadow-sm">
        <h4 className="text-sm font-black text-foreground font-iran-yekan mb-1">
          دیدگاه یا پرسش خود را درباره این مقاله بنویسید
        </h4>
        <p className="text-xs text-muted-foreground font-iran-yekan mb-4">
          نظرات شما پس از تایید توسط تحریریه، در سایت نمایش داده خواهد شد.
        </p>

        <form onSubmit={handleSubmit(onCommentSubmit)} className="flex flex-col gap-4">
          <TextArea
            placeholder="متن دیدگاه خود را وارد کنید..."
            rows={4}
            error={errors.comment?.message}
            className="text-xs md:text-sm font-iran-yekan leading-relaxed"
            {...register('comment')}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 select-none">
              <Checkbox
                checked={watchIncognito}
                onChange={(checked) => setValue('isIncognito', checked)}
              />
              <span className="text-xs font-medium font-iran-yekan text-foreground">
                ارسال دیدگاه به صورت ناشناس
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createComment.isPending}
              className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-6 shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <Send className="h-3.5 w-3.5 transform rotate-180" />
              <span>ارسال دیدگاه</span>
            </Button>
          </div>
        </form>
      </div>

      {/* لیست دیدگاه‌ها */}
      <div className="flex flex-col gap-4 mt-2">
        {isLoading ? (
          <div className="w-full py-8 text-center text-xs text-muted-foreground font-iran-yekan">
            در حال دریافت دیدگاه‌ها...
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((c) => (
              <div key={c.id} className="p-4 md:p-5 border rounded-2xl bg-card flex flex-col gap-3 text-right">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground font-iran-yekan">
                      {c.creatorName}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-iran-yekan">
                    {c.createDateFormatted}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-foreground leading-relaxed font-iran-yekan whitespace-pre-wrap">
                  {c.comment}
                </p>
              </div>
            ))}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        ) : (
          <div className="w-full py-12 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 stroke-[1.5]" />
            <span className="text-xs font-bold font-iran-yekan text-muted-foreground">
              هنوز دیدگاهی برای این مقاله ثبت نشده است. اولین نفری باشید که دیدگاه می‌نویسد!
            </span>
          </div>
        )}
      </div>

    </div>
  );
}