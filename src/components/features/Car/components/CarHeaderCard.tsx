'use client';

import * as React from 'react';
import { Car as CarIcon, Search, X } from 'lucide-react';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { SelectPartModal } from '@/components/features/Part/components/SelectPartModal';
import { Modal, ModalBody } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { cn } from '@/design-system/utils/cn';
import { getCarUrl, getFullUrl } from '@/core/utils/formatters';

export interface CarHeaderCardProps {
  slug: string;
  carName: string;
  carCover: string | null;
}

export function CarHeaderCard({ slug, carName, carCover }: CarHeaderCardProps) {
  const [isChangeCarOpen, setIsChangeCarOpen] = React.useState(false);
  const [isSelectPartOpen, setIsSelectPartOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: cars = [], isLoading: isCarsLoading } = useGetCarListFlat(1, 200);
  const filteredCars = cars.filter((car: any) =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <Card className="flex w-full flex-col justify-between gap-5 p-4 shadow-xs md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            <img src={getFullUrl(carCover)} className="h-full w-full object-contain" alt="" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xs font-bold text-muted-foreground md:text-xs">خودرو انتخاب شده:</span>
            <h2 className="text-sm font-bold text-foreground md:text-base">{carName}</h2>
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
            className="h-10 px-5 text-xs font-bold"
          >
            تغییر خودرو
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSelectPartOpen(true)}
            className="h-10 px-5 text-xs font-bold shadow-xs"
          >
            انتخاب قطعه
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isChangeCarOpen}
        onClose={() => setIsChangeCarOpen(false)}
        className="flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0 md:relative md:h-[550px] md:max-h-[90vh] md:max-w-2xl md:rounded-lg md:overflow-hidden"
        overlayClassName="bg-foreground/40 backdrop-blur-md"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <CarIcon aria-hidden="true" className="h-4 w-4 text-primary" />
            تغییر خودرو فعال
          </span>
          <button
            type="button"
            onClick={() => setIsChangeCarOpen(false)}
            aria-label="بستن"
            className="rounded-full p-1.5 transition-colors hover:bg-muted"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border bg-card p-4">
          <Input
            placeholder="جستجوی مدل خودرو (مثال: پراید، تارا...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        <ModalBody className="h-full flex-1 overflow-y-auto bg-card p-6">
          {isCarsLoading ? (
            <PageLoading label="در حال دریافت لیست خودروها..." />
          ) : filteredCars.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-4 py-1 sm:grid-cols-3">
              {filteredCars.map((car: any) => (
                <div
                  key={car.id}
                  onClick={() => {
                    window.location.href = getCarUrl(car.englishTitle);
                    setIsChangeCarOpen(false);
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-md border border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent/50',
                    slug === car.englishTitle && 'border-primary bg-accent/50 ring-1 ring-primary'
                  )}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                    <img src={getFullUrl(car.cover)} alt={car.model} className="h-full w-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-foreground sm:text-sm">{car.model}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full rounded-md border border-dashed border-border bg-card py-12 text-center">
              <span className="text-xs font-bold text-muted-foreground">خودرویی یافت نشد.</span>
            </div>
          )}
        </ModalBody>
      </Modal>

      <SelectPartModal
        isOpen={isSelectPartOpen}
        onClose={() => setIsSelectPartOpen(false)}
        slug="Fuel-System"
        categoryName={carName}
        carSlug={slug}
      />
    </div>
  );
}
