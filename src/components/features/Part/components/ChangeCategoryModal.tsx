'use client';

import { useState, useEffect } from 'react';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { Card } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { ListFilter, Search, Settings } from 'lucide-react';

interface ChangeCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeCategoryModal({ isOpen, onClose }: ChangeCategoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [], isLoading } = useGetPartCategoriesFlat();

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg w-full">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="font-iran-yekan font-bold text-sm text-foreground text-right flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-primary" />
          تغییر دسته‌بندی قطعات
        </ModalTitle>
      </ModalHeader>
      <ModalBody className="p-0 pt-4 text-right flex flex-col gap-4 h-full">
        <div className="px-4 md:px-0">
          <Input
            type="text"
            placeholder="جستجوی نام دسته‌بندی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-zinc-400" />}
            className="w-full font-iran-yekan"
          />
        </div>

        {isLoading ? (
          <PageLoading message="در حال دریافت لیست دسته‌بندی‌ها..." />
        ) : filteredCategories.length > 0 ? (
          <div className="flex-1 md:max-h-80 overflow-y-auto px-4 md:px-0 pr-1 pl-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full py-1">
              {filteredCategories.map((cat: any) => (
                <Card
                  key={cat.id}
                  onClick={() => {
                    window.location.href = `/part-category/${cat.englishTitle}`;
                  }}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-primary/40 hover:scale-[1.02] bg-card text-center flex flex-col items-center justify-center p-4 gap-3 shadow-sm transition-all"
                >
                  <div className="w-12 h-12 shrink-0 rounded-full bg-background border p-1 flex items-center justify-center overflow-hidden">
                    {cat.icon || cat.thumbnail ? (
                      <img src={getFullUrl(cat.icon || cat.thumbnail)} alt={cat.name} className="w-full h-full object-contain filter dark:invert" />
                    ) : (
                      <Settings className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-bold font-iran-yekan text-foreground truncate w-full">{cat.name}</span>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full py-12 text-center border border-dashed rounded-xl bg-card">
            <span className="text-xs font-bold font-iran-yekan text-muted-foreground">دسته‌بندی یافت نشد.</span>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}