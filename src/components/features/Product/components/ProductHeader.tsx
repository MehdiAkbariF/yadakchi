'use client';

import * as React from 'react';
import { Share2, Scale, Star, Heart, Loader2, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Typography } from '@/components/primitives/Typography';
import { ProductDetailsViewModel } from '@/domains/front/product/types/view.types';
import {
  useIsUserFavoriteProduct,
  useAddFavorite,
  useDeleteFavorite,
  useSubmitProductReport,
} from '@/domains/front/product/hooks/product.hooks';
import { useGetReportSubjects } from '@/domains/front/shop/hooks/shop.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/composites/Modal/Modal';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Button } from '@/components/primitives/Button/Button';
import { toPersianDigits } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

export interface ProductHeaderProps {
  product: ProductDetailsViewModel;
  onScrollToComments: () => void;
  onScrollToInquiries: () => void;
}

export function ProductHeader({ product, onScrollToComments, onScrollToInquiries }: ProductHeaderProps) {
  const [mounted, setMounted] = React.useState(false);
  const queryClient = useQueryClient();
  const { data: rawIsFavorite, isLoading: isFavLoading } = useIsUserFavoriteProduct(product.code);
  const addFavorite = useAddFavorite(product.code);
  const deleteFavorite = useDeleteFavorite(product.code);
  const submitProductReport = useSubmitProductReport();
  const { data: reportSubjects } = useGetReportSubjects('ProductReport');

  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');
  const [localIsFavorite, setLocalIsFavorite] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (rawIsFavorite !== undefined) setLocalIsFavorite(rawIsFavorite);
  }, [rawIsFavorite]);

  const handleFavoriteToggle = async () => {
    const previousState = localIsFavorite;
    const nextState = !previousState;
    setLocalIsFavorite(nextState);
    try {
      if (previousState) {
        await deleteFavorite.mutateAsync(product.id);
        showToast.success('از علاقه‌مندی‌ها حذف شد');
      } else {
        await addFavorite.mutateAsync(product.id);
        showToast.success('به علاقه‌مندی‌ها اضافه شد');
      }
    } catch (err: any) {
      setLocalIsFavorite(previousState);
      if (
        err?.message?.includes('قبلا ثبت شده است') ||
        err?.userMessage?.includes('قبلا ثبت شده است')
      ) {
        setLocalIsFavorite(true);
        queryClient.setQueryData(['front', 'products', 'is-favorite', product.code], true);
        return;
      }
      showToast.error(err.userMessage || 'خطا در انجام عملیات علاقه‌مندی');
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: product.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success('لینک صفحه کپی شد');
    }
  };

  const handleReportSubmit = async () => {
    if (!selectedSubjectId) {
      showToast.error('لطفاً دلیل گزارش کالا را انتخاب کنید');
      return;
    }
    try {
      await submitProductReport.mutateAsync({
        productId: product.id,
        reportSubjectId: selectedSubjectId,
        description: reportDescription,
      });
      showToast.success('گزارش خطای کالا با موفقیت ثبت شد و توسط تیم پشتیبانی بررسی خواهد گردید');
      setIsReportModalOpen(false);
      setSelectedSubjectId('');
      setReportDescription('');
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ثبت گزارش خطا');
    }
  };

  const subjectsList = reportSubjects || [];

  if (!mounted) {
    return (
      <div className="flex w-full select-none flex-col gap-4 animate-pulse">
        <div className="h-6 w-1/4 rounded-md bg-border" />
        <div className="mt-2 h-8 w-3/4 rounded-md bg-border" />
      </div>
    );
  }

  return (
    <div className="flex w-full select-none flex-col gap-4">
      <div className="flex w-full items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xs font-bold text-muted-foreground">
            کد کالا: {toPersianDigits(product.code)}
          </span>
          <span className="text-2xs text-muted-foreground">|</span>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-0.5 text-2xs font-bold text-muted-foreground outline-none hover:text-destructive"
          >
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            <span>گزارش کالا</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            aria-label="اشتراک‌گذاری"
            className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Share2 aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="مقایسه"
            className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Scale aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleFavoriteToggle}
            disabled={isFavLoading || addFavorite.isPending || deleteFavorite.isPending}
            aria-label={localIsFavorite ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
            aria-pressed={localIsFavorite}
            className="select-none rounded-md border border-border p-2 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-destructive disabled:opacity-40"
          >
            {addFavorite.isPending || deleteFavorite.isPending ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Heart
                aria-hidden="true"
                className={cn(
                  'h-4 w-4 transition-colors duration-fast',
                  localIsFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                )}
              />
            )}
          </button>
        </div>
      </div>

      <Typography variant="h3" className="font-bold leading-relaxed text-foreground">
        {toPersianDigits(product.title)}
      </Typography>

      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onScrollToComments}
          className="flex cursor-pointer items-center gap-1 outline-none"
        >
          <Star aria-hidden="true" className="h-4 w-4 shrink-0 fill-warning text-warning" />
          <span className="font-bold text-foreground">{toPersianDigits(product.averageRate)}</span>
          <span>از {toPersianDigits(product.rateCount)} نظر</span>
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          type="button"
          onClick={onScrollToInquiries}
          className="hover:text-primary hover:underline"
        >
          تبادل پرسش و پاسخ
        </button>
      </div>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} className="w-full max-w-md">
        <ModalHeader onClose={() => setIsReportModalOpen(false)}>
          <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <AlertTriangle aria-hidden="true" className="h-4 w-4 text-destructive" />
            گزارش خطای کالا
          </ModalTitle>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4 p-5 pt-4">
          <Select
            label="دلیل گزارش *"
            placeholder="دلیل گزارش را انتخاب کنید..."
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            options={subjectsList.map((sub: any) => ({ value: sub.id, label: sub.title }))}
          />

          <TextArea
            label="توضیحات (اختیاری)"
            placeholder="جزییات مشکل را بنویسید..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="h-24 text-xs"
          />
        </ModalBody>

        <ModalFooter className="gap-2.5 p-5 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsReportModalOpen(false);
              setSelectedSubjectId('');
              setReportDescription('');
            }}
            className="h-10 flex-1 text-xs font-bold"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="destructive"
            onClick={handleReportSubmit}
            isLoading={submitProductReport.isPending}
            className="h-10 flex-1 text-xs font-bold"
          >
            ثبت گزارش خطا
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}