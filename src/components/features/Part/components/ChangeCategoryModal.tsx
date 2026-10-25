'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ListFilter, Search, Settings } from 'lucide-react';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { Card } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { getFullUrl } from '@/core/utils/formatters';

export interface ChangeCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeCategoryModal({ isOpen, onClose }: ChangeCategoryModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: categories = [], isLoading } = useGetPartCategoriesFlat();

  React.useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCategory = (cat: any) => {
    // هدایت مستقیم و تمیز به دسته‌بندی جدید
    router.push(`/part-category/${encodeURIComponent(cat.englishTitle)}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <ListFilter aria-hidden="true" className="h-5 w-5 text-primary" />
          <span>تغییر دسته‌بندی قطعات</span>
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="flex h-full flex-col gap-4 p-4 pt-2">
        <Input
          type="text"
          placeholder="جستجوی نام دسته‌بندی..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          className="w-full"
        />

        {isLoading ? (
          <PageLoading label="در حال دریافت لیست دسته‌بندی‌ها..." />
        ) : filteredCategories.length > 0 ? (
          <div className="flex-1 overflow-y-auto pe-1 ps-1 scrollbar-thin md:max-h-80">
            <div className="grid w-full grid-cols-2 gap-3 py-1 sm:grid-cols-3">
              {filteredCategories.map((cat: any) => (
                <Card
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/80 bg-card p-3 text-center transition-all hover:border-primary/50 hover:bg-accent/30 active:scale-95"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/40 p-1">
                    {cat.icon || cat.thumbnail ? (
                      <img
                        src={getFullUrl(cat.icon || cat.thumbnail)}
                        alt={cat.name}
                        className="h-full w-full object-contain filter dark:invert"
                      />
                    ) : (
                      <Settings aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="w-full truncate text-xs font-bold text-foreground">{cat.name}</span>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-dashed border-border py-12 text-center">
            <span className="text-xs font-bold text-muted-foreground">دسته‌بندی یافت نشد.</span>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}