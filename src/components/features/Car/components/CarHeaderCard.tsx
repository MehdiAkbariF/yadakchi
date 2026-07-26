'use client';

import { useState } from 'react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { SelectPartModal } from '@/components/features/Part/components/SelectPartModal';
import { Car as CarIcon, Search, ArrowRight, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { getCarUrl } from '@/core/utils/formatters';

interface CarHeaderCardProps {
  slug: string;
  carName: string;
  carCover: string | null;
}

export function CarHeaderCard({ slug, carName, carCover }: CarHeaderCardProps) {
  const [isChangeCarOpen, setIsChangeCarOpen] = useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: cars = [], isLoading: isCarsLoading } = useGetCarListFlat(1, 200);

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const filteredCars = cars.filter((car: any) =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <Card className="w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4 text-right">
          <div className="w-16 h-16 shrink-0 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-muted/10 flex items-center justify-center overflow-hidden">
            <img src={getFullUrl(carCover)} className="w-full h-full object-contain" alt="" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] md:text-xs text-muted-foreground font-bold">خودرو انتخاب شده:</span>
            <h2 className="text-sm md:text-base font-black text-foreground font-iran-yekan">{carName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setIsChangeCarOpen(true);
            }}
            className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-5 border-zinc-200 text-foreground"
          >
            تغییر خودرو
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSelectPartOpen(true)}
            className="rounded-xl font-iran-yekan font-bold text-xs h-10 px-5 shadow-sm"
          >
            انتخاب قطعه
          </Button>
        </div>
      </Card>

      <Modal 
        isOpen={isChangeCarOpen} 
        onClose={() => setIsChangeCarOpen(false)} 
        className="w-full h-full max-h-full max-w-none p-0 rounded-none flex flex-col fixed inset-0 z-50 bg-background md:relative md:max-w-2xl md:h-[550px] md:max-h-[90vh] md:rounded-xl md:overflow-hidden"
        overlayClassName="bg-black/40 backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsChangeCarOpen(false)}
              className="md:hidden p-1 -mr-1 hover:bg-muted rounded-full"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
              <CarIcon className="h-4 w-4 text-primary" />
              تغییر خودرو فعال
            </span>
          </div>
          <button 
            onClick={() => setIsChangeCarOpen(false)}
            className="hidden md:flex p-1.5 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 border-b bg-background shrink-0">
          <Input
            placeholder="جستجوی مدل خودرو (مثال: پراید، تارا...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full font-iran-yekan"
          />
        </div>

        <ModalBody className="flex-1 overflow-y-auto p-6 bg-background h-full">
          {isCarsLoading ? (
            <PageLoading message="در حال دریافت لیست خودروها..." />
          ) : filteredCars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full py-1">
              {filteredCars.map((car: any) => (
                <div
                  key={car.id}
                  onClick={() => {
                    window.location.href = getCarUrl(car.englishTitle);
                    setIsChangeCarOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center group",
                    slug === car.englishTitle ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                  )}
                >
                  <div className="w-full aspect-[4/3] relative overflow-hidden rounded-lg">
                    <img
                      src={getFullUrl(car.cover)}
                      alt={car.model}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold font-iran-yekan text-foreground">{car.model}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-12 text-center border border-dashed rounded-xl bg-card">
              <span className="text-xs font-bold font-iran-yekan text-muted-foreground">خودرویی یافت نشد.</span>
            </div>
          )}
        </ModalBody>
      </Modal>

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug="Fuel-System"
        categoryName={carName}
      />
    </div>
  );
}