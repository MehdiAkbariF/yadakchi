'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, ChevronLeft, Search, X, MapPinOff, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Modal } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { useGetProvinceCitiesTree } from '@/domains/front/reference/city/hooks/city.hooks';
import { useAppStore } from '@/shared/store/useAppStore';

export interface CitySelectorProps {
  variant?: 'default' | 'mobile';
}

export function CitySelector({ variant = 'default' }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const storeCity = useAppStore((state) => state.selectedCity);
  const setStoreCity = useAppStore((state) => state.setSelectedCity);

  const { data: provincesTree = [], isLoading } = useGetProvinceCitiesTree();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedCity = mounted ? storeCity : null;

  const handleOpenModal = () => {
    setIsOpen(true);
    setSearchQuery('');
    setActiveProvinceId(null);
  };

  const handleSelectCity = (id: string, name: string) => {
    setStoreCity({ id, name });
    setIsOpen(false);
  };

  const handleClearCity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStoreCity(null);
  };

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: Array<{ id: string; name: string; provinceName: string }> = [];
    provincesTree.forEach((province) => {
      province.cities.forEach((city) => {
        if (city.name.includes(searchQuery.trim())) {
          results.push({
            id: city.id,
            name: city.name,
            provinceName: province.name,
          });
        }
      });
    });
    return results;
  }, [searchQuery, provincesTree]);

  const activeProvince =
    provincesTree.find((p) => p.id === (activeProvinceId || provincesTree[0]?.id)) || provincesTree[0];
  const isMobileVariant = variant === 'mobile';

  const renderModalContent = () => (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed inset-0 z-modal flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0 md:relative md:h-[550px] md:max-h-[90vh] md:max-w-2xl md:overflow-hidden md:rounded-xl md:border md:border-border md:shadow-lg"
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/20 px-4 py-3.5" dir="rtl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label="بازگشت"
            type="button"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            انتخاب شهر یا استان
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hidden rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
          aria-label="بستن"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="shrink-0 border-b border-border bg-card p-4" dir="rtl">
        <Input
          type="text"
          placeholder="جستجوی نام شهر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          rightIcon={
            searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
                type="button"
                aria-label="پاک کردن متن"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            ) : undefined
          }
          className="w-full border-border bg-card"
          dir="rtl"
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden" dir="rtl">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">در حال دریافت لیست شهرها...</span>
          </div>
        ) : searchQuery.trim() ? (
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city.id, city.name)}
                  className="flex w-full items-center justify-between rounded-md border border-border p-3 transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  <span className="text-sm font-medium text-foreground">{city.name}</span>
                  <span className="text-xs text-muted-foreground">استان {city.provinceName}</span>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <MapPinOff className="h-8 w-8 text-muted-foreground/60" />
                <span className="text-sm">شهری با این نام یافت نشد.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-[140px] shrink-0 overflow-y-auto border-l border-border bg-muted/20 py-1 md:w-[200px]">
              {provincesTree.map((province) => {
                const isActive = activeProvince?.id === province.id;
                return (
                  <button
                    key={province.id}
                    type="button"
                    onClick={() => setActiveProvinceId(province.id)}
                    className={cn(
                      'w-full truncate px-4 py-3 text-right text-xs font-medium transition-colors md:text-sm',
                      isActive
                        ? 'border-r-2 border-primary bg-card font-bold text-primary'
                        : 'text-foreground hover:bg-muted/40'
                    )}
                  >
                    {province.name}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto bg-card p-4">
              {activeProvince ? (
                <div className="space-y-3">
                  <span className="block border-b border-border pb-2 text-xs font-bold text-muted-foreground">
                    شهرهای استان {activeProvince.name} ({activeProvince.cities.length} شهر)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {activeProvince.cities.map((city) => {
                      const isSelected = selectedCity?.id === city.id;
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => handleSelectCity(city.id, city.name)}
                          className={cn(
                            'truncate rounded-md border px-3 py-2 text-right text-xs transition-colors md:text-sm',
                            isSelected
                              ? 'border-primary bg-primary/10 font-bold text-primary'
                              : 'border-border text-foreground hover:border-primary/40 hover:bg-muted/40'
                          )}
                        >
                          {city.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  استان مورد نظر را انتخاب کنید.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

  if (isMobileVariant) {
    return (
      <>
        <div
          onClick={handleOpenModal}
          dir="rtl"
          className="flex w-full cursor-pointer items-center justify-between px-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {selectedCity ? `موقعیت شما: ${selectedCity.name}` : 'انتخاب شهر (تعیین موقعیت)'}
            </span>
          </div>

          <div
            className="flex items-center gap-2"
            onClick={(e) => selectedCity && e.stopPropagation()}
          >
            {selectedCity ? (
              <button
                type="button"
                onClick={handleClearCity}
                className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="حذف موقعیت"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </div>

        {renderModalContent()}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        dir="rtl"
        className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border hover:bg-muted/60 shadow-xs xl:text-sm"
        onClick={handleOpenModal}
        aria-label="انتخاب شهر"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary xl:h-4 xl:w-4" />
        <span className="font-medium text-foreground">
          {selectedCity ? selectedCity.name : 'انتخاب شهر'}
        </span>
        {selectedCity ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClearCity}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleClearCity(e as any);
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {renderModalContent()}
    </>
  );
}