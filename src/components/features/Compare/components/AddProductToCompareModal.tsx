// src/components/features/Compare/components/AddProductToCompareModal.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Search, Loader2, Plus, X, Sparkles } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { useSearchProducts } from '@/domains/front/product/hooks/product.hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

interface AddProductToCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productCode: number) => void;
  existingCodes: number[];
}

export function AddProductToCompareModal({
  isOpen,
  onClose,
  onSelectProduct,
  existingCodes,
}: AddProductToCompareModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  // در صورت خالی بودن سرچ، ۱۰ محصول پیشنهادی می‌آورد
  const isSearching = debouncedSearch.trim().length > 0;

  const { data: searchResult, isLoading } = useSearchProducts(
    {
      searchTitle: isSearching ? debouncedSearch.trim() : undefined,
      pageSize: isSearching ? 20 : 10,
    },
    { enabled: isOpen }
  );

  const items = searchResult?.items || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-lg h-[85vh] md:h-auto overflow-hidden rounded-2xl flex flex-col"
    >
      <ModalHeader onClose={onClose}>
        <ModalTitle className="text-title-sm">
          افزودن کالا به میز مقایسه
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="flex flex-1 min-h-0 flex-col gap-3 p-4" dir="rtl">
        <div className="relative w-full shrink-0">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="نام قطعه، مدل خودرو یا کد فنی را بنویسید..."
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            rightIcon={
              searchTerm ? (
                <button type="button" onClick={() => setSearchTerm('')} className="p-1">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ) : undefined
            }
            className="w-full text-xs font-bold rounded-xl"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-3xs font-bold text-muted-foreground flex items-center gap-1">
            {!isSearching ? (
              <>
                <Sparkles className="h-3 w-3 text-warning" />
                کالاهای پیشنهادی جهت مقایسه
              </>
            ) : (
              `نتایج جستجو برای "${debouncedSearch}"`
            )}
          </span>
          <span className="text-3xs text-muted-foreground font-semibold">
            {toPersianDigits(items.length)} مورد
          </span>
        </div>

        {/* لیست محصولات */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto no-scrollbar pr-0.5">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-16 text-label-muted">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>در حال بارگذاری کالاها...</span>
            </div>
          ) : items.length > 0 ? (
            items.map((prod: any) => {
              const code = prod.code || prod.productCode;
              const isAlreadyAdded = existingCodes.includes(code);

              return (
                <div
                  key={prod.id || code}
                  onClick={() => {
                    if (!isAlreadyAdded) {
                      onSelectProduct(code);
                      onClose();
                    }
                  }}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                    isAlreadyAdded
                      ? 'bg-muted/40 border-border/40 opacity-60 cursor-not-allowed'
                      : 'bg-card border-border/80 hover:border-primary/50 cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative h-12 w-12 shrink-0 rounded-lg border border-border bg-muted/20 overflow-hidden">
                      <Image
                        src={getFullUrl(prod.images?.[0]?.medium || prod.image)}
                        alt={prod.name || prod.title}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 text-right">
                      <span className="truncate text-label">
                        {prod.name || prod.title}
                      </span>
                      <span className="text-3xs text-muted-foreground mt-0.5">
                        کد کالا: {toPersianDigits(code)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isAlreadyAdded}
                    className={`flex h-7 shrink-0 items-center gap-1 px-2.5 rounded-lg text-2xs font-bold transition-all ${
                      isAlreadyAdded
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground shadow-xs active:scale-95'
                    }`}
                  >
                    <Plus className="h-3 w-3" />
                    <span>{isAlreadyAdded ? 'افزوده شده' : 'انتخاب'}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-1 items-center justify-center py-16 text-center text-xs text-muted-foreground">
              کالایی با این مشخصات یافت نشد.
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}