'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useCreateComment, 
  useUpdateComment 
} from '@/domains/front/comment/hooks/comment.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Star, MessageSquare } from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

interface WriteCommentFormValues {
  comment: string;
}

interface WriteCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  editingComment: any;
}

export function WriteCommentModal({ isOpen, onClose, product, editingComment }: WriteCommentModalProps) {
  const queryClient = useQueryClient();
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();

  const [rate, setRate] = useState(5);
  const [hoverRate, setHoverRate] = useState(0);
  const [isIncognito, setIsIncognito] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WriteCommentFormValues>({
    resolver: zodResolver(
      z.object({
        comment: z.string().min(10, 'متن نظر باید حداقل ۱۰ کاراکتر باشد').max(1000, 'متن نظر بسیار طولانی است')
      })
    ),
    defaultValues: {
      comment: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (editingComment) {
        setRate(editingComment.rate);
        setIsIncognito(editingComment.isIncognito || false);
        reset({
          comment: editingComment.comment
        });
      } else {
        setRate(5);
        setIsIncognito(false);
        reset({
          comment: ''
        });
      }
    }
  }, [isOpen, editingComment, reset]);

  const onCommentSubmit = async (data: WriteCommentFormValues) => {
    if (!product) return;

    try {
      if (editingComment) {
        await updateComment.mutateAsync({
          id: editingComment.id,
          rate: rate
        });
        showToast.success('تغییرات نظر شما با موفقیت ثبت شد');
      } else {
        await createComment.mutateAsync({
          productId: product.productId,
          comment: data.comment,
          rate: rate,
          isIncognito: isIncognito
        });
        showToast.success('نظرات ارزشمند شما با موفقیت ثبت شد');
      }
      queryClient.invalidateQueries({ queryKey: ['user', 'comments'] });
      onClose();
    } catch (error) {
      console.error('[WriteCommentModal] Submission failed:', error);
    }
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
   <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
  <ModalHeader onClose={onClose}>
    <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
      <MessageSquare className="h-5 w-5 text-primary" />
      {editingComment ? "ویرایش نظر و امتیاز محصول" : "ثبت نظر و امتیاز جدید"}
    </ModalTitle>
  </ModalHeader>
  
  <ModalBody className="p-5 pt-4 text-right">
    {product && (
      <form onSubmit={handleSubmit(onCommentSubmit)} className="flex flex-col gap-4 w-full text-right">
        
        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border">
          <div className="w-10 h-10 shrink-0 rounded-lg border bg-background flex items-center justify-center overflow-hidden p-0.5">
            <img src={getFullUrl(product.productImage)} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-foreground truncate block">{product.productTitle}</span>
            {product.shopTitle && (
              <span className="text-[10px] text-muted-foreground block mt-0.5">فروشگاه {product.shopTitle}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center text-center py-2 border-b border-dashed w-full select-none">
          <span className="text-xs font-bold text-muted-foreground font-iran-yekan">امتیاز شما به کالا *</span>
          <div className="flex items-center gap-1.5 mt-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isHighlighted = (hoverRate || rate) >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  onMouseEnter={() => setHoverRate(starValue)}
                  onMouseLeave={() => setHoverRate(0)}
                  onClick={() => setRate(starValue)}
                  className="p-1 hover:scale-110 transition-transform outline-none"
                >
                  <Star 
                    className={cn(
                      "h-7 w-7 shrink-0", 
                      isHighlighted ? "fill-yellow-400 text-yellow-400" : "text-zinc-200 dark:text-zinc-800"
                    )} 
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          <TextArea
            label="متن نظر *"
            placeholder="نظر خود را در مورد این کالا بنویسید..."
            error={errors.comment?.message ? String(errors.comment.message) : undefined}
            className="h-28 text-xs font-iran-yekan"
            disabled={!!editingComment}
            {...register('comment')}
          />
        </div>

        {!editingComment && (
          <div className="flex items-center gap-2.5 pt-2 select-none">
            <input
              type="checkbox"
              id="comment_is_incognito"
              className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
              checked={isIncognito}
              onChange={(e) => setIsIncognito(e.target.checked)}
            />
            <label htmlFor="comment_is_incognito" className="text-xs font-bold text-foreground font-iran-yekan cursor-pointer">
              ارسال به صورت ناشناس (نام شما به بقیه نشان داده نشود)
            </label>
          </div>
        )}

      </form>
    )}
  </ModalBody>

  {/* فوتر با دکمه‌های تمام عرض */}
  <div className="flex flex-row gap-2.5 p-5 pt-4 border-t border-border/50 w-full shrink-0">
    <Button
      type="button"
      variant="outline"
      onClick={onClose}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-yekan"
    >
      انصراف
    </Button>
    <Button
      type="submit"
      variant="primary"
      isLoading={createComment.isPending || updateComment.isPending}
      className="flex-1 rounded-xl text-xs h-10 font-bold font-iran-yekan"
      onClick={handleSubmit(onCommentSubmit)}
    >
      {editingComment ? "ثبت تغییرات نظر" : "ثبت نهایی نظر"}
    </Button>
  </div>
</Modal>
  );
}