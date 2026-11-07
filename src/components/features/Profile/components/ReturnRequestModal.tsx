'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { useGetReturnRequestReasons, useSubmitReturnRequest } from '@/domains/userpanel/hooks/userpanel.hooks';
import { toPersianDigits, getFullUrl } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { Paperclip, FileText, X, RotateCcw, Package } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface ItemFormState {
  selected: boolean;
  quantity: number;
  reasonId: string;
  description: string;
  files: File[];
}

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  subOrder: any;
}

export function ReturnRequestModal({ isOpen, onClose, subOrder }: ReturnRequestModalProps) {
  const router = useRouter();
  const { data: reasons = [] } = useGetReturnRequestReasons();
  const submitReturn = useSubmitReturnRequest();

  const [itemsState, setItemsState] = React.useState<Record<string, ItemFormState>>({});

  React.useEffect(() => {
    if (isOpen && subOrder?.subOrderItems) {
      const initial: Record<string, ItemFormState> = {};
      subOrder.subOrderItems.forEach((it: any) => {
        initial[it.id] = {
          selected: false,
          quantity: 1,
          reasonId: '',
          description: '',
          files: [],
        };
      });
      setItemsState(initial);
    }
  }, [isOpen, subOrder]);

  if (!subOrder) return null;

  const handleToggleSelect = (itemId: string) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selected: !prev[itemId]?.selected,
      },
    }));
  };

  const handleQuantityChange = (itemId: string, qty: number) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: qty },
    }));
  };

  const handleReasonChange = (itemId: string, reasonId: string) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], reasonId },
    }));
  };

  const handleDescChange = (itemId: string, desc: string) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], description: desc },
    }));
  };

  const handleAddFiles = (itemId: string, newFiles: FileList | null) => {
    if (!newFiles) return;
    const arrayFiles = Array.from(newFiles).filter((f) => f.type.startsWith('image/'));
    setItemsState((prev) => {
      const current = prev[itemId]?.files || [];
      const merged = [...current, ...arrayFiles].slice(0, 5);
      return {
        ...prev,
        [itemId]: { ...prev[itemId], files: merged },
      };
    });
  };

  const handleRemoveFile = (itemId: string, fileIndex: number) => {
    setItemsState((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        files: (prev[itemId]?.files || []).filter((_, i) => i !== fileIndex),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedItemIds = Object.keys(itemsState).filter((id) => itemsState[id]?.selected);

    if (selectedItemIds.length === 0) {
      showToast.error('لطفاً حداقل یک کالا را برای مرجوعی انتخاب کنید');
      return;
    }

    for (const id of selectedItemIds) {
      const state = itemsState[id];
      if (!state.reasonId) {
        showToast.error('لطفاً علت مرجوعی را برای تمام کالاهای انتخاب‌شده مشخص کنید');
        return;
      }
      if (state.description.trim().length < 10) {
        showToast.error('شرح علت مرجوعی برای هر کالا باید حداقل ۱۰ کاراکتر باشد');
        return;
      }
    }

    try {
      const itemsPayload = selectedItemIds.map((id) => {
        const state = itemsState[id];
        return {
          subOrderItemId: id,
          quantity: state.quantity,
          returnRequestReasonId: state.reasonId,
          description: state.description.trim(),
          files: state.files,
        };
      });

      const response: any = await submitReturn.mutateAsync({
        subOrderId: subOrder.id,
        items: itemsPayload,
      });

      showToast.success('درخواست مرجوعی با موفقیت ثبت شد');
      onClose();

      const returnId = response?.id || response?.data?.id || response?.returnRequestId;
      if (returnId) {
        router.push(`/profile/returns/${returnId}`);
      } else {
        router.push('/profile/returns');
      }
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در ثبت درخواست مرجوعی');
    }
  };

  const reasonOptions = reasons.map((r: any) => ({
    value: r.id,
    label: r.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-title-sm">
          <RotateCcw className="h-5 w-5 text-destructive" />
          <span>ثبت درخواست مرجوعی مرسوله ({subOrder.shop?.shopTitle})</span>
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="max-h-[75vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs leading-relaxed text-foreground">
            کالاهایی که قصد مرجوع کردن آن‌ها را دارید انتخاب فرمایید. پس از تأیید درخواست، کارشناسان ما وضعیت را بررسی و تیکت پشتیبانی فعال خواهد شد.
          </div>

          <div className="flex flex-col gap-4">
            {subOrder.subOrderItems?.map((item: any) => {
              const state = itemsState[item.id] || {
                selected: false,
                quantity: 1,
                reasonId: '',
                description: '',
                files: [],
              };

              const quantityOptions = Array.from({ length: item.quantity || 1 }, (_, i) => ({
                value: String(i + 1),
                label: `${toPersianDigits(i + 1)} عدد`,
              }));

              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    state.selected ? 'border-primary/50 bg-primary/5' : 'border-border/70 bg-card'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={state.selected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="mt-1"
                    />

                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-1">
                        {item.shopProduct?.product?.image ? (
                          <img
                            src={getFullUrl(item.shopProduct.product.image)}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="line-clamp-1 text-label">
                          {item.shopProduct?.product?.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          تعداد خریداری شده: {toPersianDigits(item.quantity)} عدد
                        </span>
                      </div>
                    </div>
                  </div>

                  {state.selected && (
                    <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4">
                      {item.quantity > 1 && (
                        <div className="w-full sm:w-48">
                          <Select
                            label="تعداد مرجوعی *"
                            value={String(state.quantity)}
                            onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                            options={quantityOptions}
                            required
                          />
                        </div>
                      )}

                      <div className="w-full">
                        <Select
                          label="علت مرجوعی *"
                          placeholder="انتخاب دلیل..."
                          value={state.reasonId}
                          onChange={(e) => handleReasonChange(item.id, e.target.value)}
                          options={reasonOptions}
                          required
                        />
                      </div>

                      <div className="w-full">
                        <TextArea
                          label="توضیحات و شرح مشکل *"
                          placeholder="مشکل، عیب یا مغایرت قطعه را به دقت شرح دهید (حداقل ۱۰ کاراکتر)..."
                          value={state.description}
                          onChange={(e) => handleDescChange(item.id, e.target.value)}
                          className="h-20 text-xs"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <span className="text-label-muted">
                          تصاویر قطعه معیوب یا مغایر (حداکثر ۵ تصویر)
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 text-xs font-bold text-primary hover:bg-primary/5">
                            <Paperclip className="h-4 w-4" />
                            <span>افزودن عکس</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleAddFiles(item.id, e.target.files)}
                              className="hidden"
                            />
                          </label>

                          {state.files.map((file, fIdx) => (
                            <div
                              key={fIdx}
                              className="flex h-9 max-w-[8.125rem] items-center gap-2 rounded-xl border bg-muted/30 px-2 text-xs font-semibold text-foreground"
                            >
                              <FileText className="h-4 w-4 shrink-0 text-primary" />
                              <span className="truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(item.id, fIdx)}
                                className="rounded-full p-1 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-sm font-bold">
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitReturn.isPending}
              className="h-9 px-5 text-xs font-bold shadow-xs"
            >
              ثبت نهایی درخواست مرجوعی
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}