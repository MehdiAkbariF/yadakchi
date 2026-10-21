'use client';

import * as React from 'react';
import { Car, Search, Loader2, ArrowRight, X } from 'lucide-react';
import { useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { Modal, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Typography } from '@/components/primitives/Typography';
import { cn } from '@/design-system/utils/cn';
import { getCarUrl, getFullUrl } from '@/core/utils/formatters';

interface CarItem {
  id: string;
  model: string;
  englishTitle: string;
  cover: string;
  coverAlt: string | null;
}

export function ShopByCar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedCar, setSelectedCar] = React.useState<CarItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: cars = [], isLoading } = useGetCarListFlat(1, 200, { enabled: isOpen });

  const handleSearchSubmit = () => {
    if (selectedCar) window.location.href = getCarUrl(selectedCar.englishTitle);
  };

  const filteredCars = cars.filter(
    (car: CarItem) =>
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.englishTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full flex-col items-center gap-2.5 py-1 md:py-4">
      <Typography variant="h4" className="text-center text-sm font-bold text-foreground sm:text-base md:text-lg">
        خرید بر اساس خودرو
      </Typography>

      <div className="flex w-full max-w-2xl flex-col items-stretch gap-3 px-4 sm:flex-row sm:px-0">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-12 flex-1 items-center justify-between rounded-md border border-border bg-card px-4 py-3 shadow-xs outline-none transition-colors hover:border-primary/40"
        >
          {selectedCar ? (
            <div className="flex items-center gap-2">
              <img
                src={getFullUrl(selectedCar.cover)}
                alt={selectedCar.model}
                className="h-7 w-10 rounded-sm object-contain"
              />
              <span className="text-sm font-bold text-foreground">{selectedCar.model}</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">مدل خودروی خود را انتخاب کنید...</span>
          )}
          <Car aria-hidden="true" className="me-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>

        <Button
          variant="primary"
          onClick={handleSearchSubmit}
          disabled={!selectedCar}
          className="h-12 shrink-0 rounded-md px-8 text-sm font-bold shadow-xs"
          leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
        >
          جستجوی قطعات
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0 md:relative md:h-[550px] md:max-h-[90vh] md:max-w-2xl md:rounded-lg md:overflow-hidden"
        overlayClassName="bg-foreground/40 backdrop-blur-md"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="بازگشت"
              className="-me-1 rounded-full p-1 hover:bg-muted md:hidden"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
            <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Car aria-hidden="true" className="h-4 w-4 text-primary" />
              انتخاب خودرو
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="بستن"
            className="hidden rounded-full p-1.5 transition-colors hover:bg-muted md:flex"
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

        <ModalBody className="flex-1 overflow-y-auto bg-card p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <Loader2 aria-hidden="true" className="h-7 w-7 animate-spin text-primary" />
              <Typography variant="small" color="muted">
                در حال لود لیست خودروها...
              </Typography>
            </div>
          ) : filteredCars.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filteredCars.map((car: CarItem) => (
                <div
                  key={car.id}
                  onClick={() => {
                    setSelectedCar(car);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-md border border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent/50',
                    selectedCar?.id === car.id && 'border-primary bg-accent/50 ring-1 ring-primary'
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
            <div className="py-12 text-center">
              <Typography variant="small" color="muted">
                خودرویی با مشخصات مدنظر یافت نشد.
              </Typography>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}
