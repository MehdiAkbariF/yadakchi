'use client';

import { useState, useEffect } from 'react';
import { Share2, Scale, Star, Heart, Loader2, AlertTriangle } from 'lucide-react';
import { Typography } from '@/components/primitives/Typography';
import { ProductDetailsViewModel } from '@/domains/front/product/types/view.types';
import { useIsUserFavoriteProduct, useAddFavorite, useDeleteFavorite, useSubmitProductReport } from '@/domains/front/product/hooks/product.hooks';
import { useGetReportSubjects } from '@/domains/front/shop/hooks/shop.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/composites/Modal/Modal';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Button } from '@/components/primitives/Button/Button';
import { toPersianDigits } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';
import { useQueryClient } from '@tanstack/react-query';

interface ProductHeaderProps {
  product: ProductDetailsViewModel;
  onScrollToComments: () => void;
  onScrollToInquiries: () => void;
}

export function ProductHeader({ product, onScrollToComments, onScrollToInquiries }: ProductHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  
  // دریافت وضعیت علاقه‌مندی خام از سرور
  const { data: rawIsFavorite, isLoading: isFavLoading } = useIsUserFavoriteProduct(product.code);
  
  const addFavorite = useAddFavorite(product.code);
  const deleteFavorite = useDeleteFavorite(product.code);
  const submitProductReport = useSubmitProductReport();
  const { data: reportSubjects } = useGetReportSubjects('ProductReport');

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  // استیت محلی خوش‌بینانه برای وضعیت قلب
  const [localIsFavorite, setLocalIsFavorite] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  // اصلاح وارونگی منطقی API در کلاینت: مقدار خام سرور نقیض (!) می‌شود تا منطق لایک/دیسلایک درست کار کند
  useEffect(() => {
    if (rawIsFavorite !== undefined) {
      setLocalIsFavorite(!rawIsFavorite);
    }
  }, [rawIsFavorite]);

  const handleFavoriteToggle = async () => {
    const previousState = localIsFavorite;
    const nextState = !previousState;

    // ۱. به‌روزرسانی آنی قلب در رابط کاربری جهت بازخورد سریع به کاربر
    setLocalIsFavorite(nextState);

    try {
      if (previousState) {
        // اگر قبلاً لایک شده بود (قرمز بود)، حالا حذفش می‌کنیم
        await deleteFavorite.mutateAsync(product.id);
        showToast.success('از علاقه‌مندی‌ها حذف شد');
      } else {
        // اگر لایک نشده بود (خاکستری بود)، حالا اضافه‌اش می‌کنیم
        await addFavorite.mutateAsync(product.id);
        showToast.success('به علاقه‌مندی‌ها اضافه شد');
      }
    } catch (err: any) {
      // ۲. در صورت ناموفق بودن درخواست سرور، وضعیت به حالت قبل بازمی‌گردد
      setLocalIsFavorite(previousState);

      if (
        err?.message?.includes('قبلا ثبت شده است') || 
        err?.userMessage?.includes('قبلا ثبت شده است')
      ) {
        setLocalIsFavorite(true);
        queryClient.setQueryData(['front', 'products', 'is-favorite', product.code], false); // متناسب با منطق معکوس API
        return;
      }
      showToast.error(err.userMessage || 'خطا در انجام عملیات علاقه‌مندی');
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href
      }).catch(() => {});
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
      <div className="w-full flex flex-col gap-4 text-right select-none animate-pulse">
        <div className="h-6 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-2" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 text-right select-none">
      
      <div className="flex items-center justify-between w-full border-b pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground font-iran-yekan">کد کالا: {toPersianDigits(product.code)}</span>
          <span className="text-zinc-300 text-[10px]">|</span>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-[10px] font-bold font-iran-yekan text-muted-foreground hover:text-destructive flex items-center gap-0.5 outline-none"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>گزارش کالا</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all">
            <Scale className="h-4 w-4" />
          </button>
          <button 
            onClick={handleFavoriteToggle} 
            disabled={isFavLoading || addFavorite.isPending || deleteFavorite.isPending}
            className="p-2 border rounded-xl hover:bg-muted text-muted-foreground hover:text-destructive transition-all disabled:opacity-40 select-none outline-none"
          >
            {addFavorite.isPending || deleteFavorite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Heart className={cn(
                "h-4 w-4 transition-colors duration-200", 
                localIsFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} />
            )}
          </button>
        </div>
      </div>

      <Typography variant="h3" className="text-right font-iran-yekan font-extrabold text-foreground leading-relaxed">
        {toPersianDigits(product.title)}
      </Typography>

      <div className="flex flex-wrap items-center gap-4 text-xs font-iran-yekan text-muted-foreground mt-1">
        <div className="flex items-center gap-1 cursor-pointer" onClick={onScrollToComments}>
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
          <span className="font-bold text-foreground">{toPersianDigits(product.averageRate)}</span>
          <span>از {toPersianDigits(product.rateCount)} نظر</span>
        </div>
        <span className="text-zinc-300">|</span>
        <button onClick={onScrollToInquiries} className="hover:text-primary hover:underline">تبادل پرسش و پاسخ</button>
      </div>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} className="max-w-md w-full">
        <ModalHeader onClose={() => setIsReportModalOpen(false)}>
          <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
            گزارش خطای کالا
          </ModalTitle>
        </ModalHeader>
        
        <ModalBody className="p-5 pt-4 text-right flex flex-col gap-4">
          <div className="flex flex-col gap-1 w-full">
            <Select
              label="دلیل گزارش *"
              placeholder="دلیل گزارش را انتخاب کنید..."
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              options={subjectsList.map((sub: any) => ({
                value: sub.id,
                label: sub.title,
              }))}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <TextArea
              label="توضیحات (اختیاری)"
              placeholder="جزییات مشکل را بنویسید..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="h-24 text-xs font-iran-yekan"
            />
          </div>
        </ModalBody>

        <ModalFooter className="p-5 pt-4 gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsReportModalOpen(false);
              setSelectedSubjectId('');
              setReportDescription('');
            }}
            className="rounded-xl text-xs h-10 font-bold font-iran-yekan flex-1"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="destructive"
            onClick={handleReportSubmit}
            isLoading={submitProductReport.isPending}
            className="rounded-xl text-xs h-10 font-bold font-iran-yekan flex-1"
          >
            ثبت گزارش خطا
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
}