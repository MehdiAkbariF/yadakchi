// src/components/sections/Header/components/CitySelector/CitySelector.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapPin, ChevronDown, ChevronLeft, Search, X, MapPinOff, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { Modal } from '@/components/composites/Modal/Modal';
import { Input } from '@/components/primitives/Input/Input';
import { useGetProvinceCitiesTree } from '@/domains/front/reference/city/hooks/city.hooks';

const LOCAL_STORAGE_KEY = 'yadakchi_selected_city';
const CITY_EVENT_NAME = 'yadakchi_city_changed';

export interface CitySelectorProps {
  variant?: 'default' | 'mobile';
}

export function CitySelector({ variant = 'default' }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  
  // لود درخت‌واره استان‌ها و شهرها از هوک دامین
  const { data: provincesTree = [], isLoading } = useGetProvinceCitiesTree();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null);

  // لود اطلاعات شهر انتخاب شده در بارگذاری اولیه
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setSelectedCity(JSON.parse(saved));
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    // شنونده رویداد اختصاصی برای سینک سراسری
    const handleCitySync = () => {
      const updated = localStorage.getItem(LOCAL_STORAGE_KEY);
      setSelectedCity(updated ? JSON.parse(updated) : null);
    };

    window.addEventListener(CITY_EVENT_NAME, handleCitySync);
    return () => window.removeEventListener(CITY_EVENT_NAME, handleCitySync);
  }, []);

  // کنترل تغییرات تاریخچه و دکمه بازگشت در موبایل برای بستن مودال با دکمه Back گوشی
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      setIsOpen(false);
    };

    window.history.pushState({ modalOpen: 'city-selector' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);

  const handleOpenModal = () => {
    setIsOpen(true);
    setSearchQuery('');
    setActiveProvinceId(null);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    if (window.history.state?.modalOpen === 'city-selector') {
      window.history.back();
    }
  };

  // ذخیره شهر انتخاب شده
  const handleSelectCity = (id: string, name: string) => {
    const cityData = { id, name };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cityData));
    setSelectedCity(cityData);
    
    // ارسال سیگنال سینک به تمام هدرها و سایدبارهای موازی در صفحه
    window.dispatchEvent(new Event(CITY_EVENT_NAME));
    handleCloseModal();
  };

  // حذف انتخاب شهر جاری
  const handleClearCity = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSelectedCity(null);
    window.dispatchEvent(new Event(CITY_EVENT_NAME));
  };

  // فیلتر کردن هوشمند و سریع شهرها در تمام استان‌ها بر اساس تایپ کاربر
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results: Array<{ id: string; name: string; provinceName: string }> = [];
    provincesTree.forEach(province => {
      province.cities.forEach(city => {
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

  // دسته‌بندی استان فعال
  const activeProvince = provincesTree.find(p => p.id === (activeProvinceId || provincesTree[0]?.id)) || provincesTree[0];

  const isMobileVariant = variant === 'mobile';

  // محتوای اصلی مودال (مشترک بین دسکتاپ و موبایل)
  const renderModalContent = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      className="w-full h-full max-h-full max-w-none p-0 rounded-none flex flex-col fixed inset-0 z-50 bg-background md:relative md:max-w-2xl md:h-[550px] md:max-h-[90vh] md:rounded-xl md:p-0 md:overflow-hidden"
      overlayClassName="bg-black/40 backdrop-blur-md"
    >
      {/* سربرگ مودال */}
      <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCloseModal}
            className="md:hidden p-1 -mr-1 hover:bg-muted rounded-full"
            aria-label="بازگشت"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            انتخاب شهر یا استان
          </span>
        </div>
        <button 
          onClick={handleCloseModal}
          className="hidden md:flex p-1.5 hover:bg-muted rounded-full transition-colors"
          aria-label="بستن"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* بخش نوار جستجو */}
      <div className="p-4 border-b shrink-0 bg-background">
        <Input
          type="text"
          placeholder="جستجوی نام شهر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          rightIcon={
            searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
                type="button"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )
          }
          className="w-full font-iran-sans"
          dir="rtl"
        />
      </div>

      {/* بدنه لیست‌ها */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-iran-sans">در حال دریافت لیست شهرها...</span>
          </div>
        ) : searchQuery.trim() ? (
          /* نتایج جستجو */
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <button
                  key={city.id}
                  onClick={() => handleSelectCity(city.id, city.name)}
                  className="flex items-center justify-between w-full p-3 rounded-lg border hover:border-primary/40 hover:bg-primary/5 text-right transition-all font-iran-sans"
                >
                  <span className="text-sm font-medium text-foreground">{city.name}</span>
                  <span className="text-xs text-muted-foreground">استان {city.provinceName}</span>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <MapPinOff className="h-8 w-8 text-muted-foreground/60" />
                <span className="text-sm font-iran-sans">شهری با این نام یافت نشد.</span>
              </div>
            )}
          </div>
        ) : (
          /* دو ستونه استان و شهر */
          <div className="flex-1 flex overflow-hidden">
            {/* ستون استان‌ها */}
            <div className="w-[140px] md:w-[220px] bg-muted/20 border-l overflow-y-auto py-1 shrink-0">
              {provincesTree.map(province => {
                const isActive = activeProvince?.id === province.id;
                return (
                  <button
                    key={province.id}
                    onClick={() => setActiveProvinceId(province.id)}
                    className={cn(
                      "w-full px-4 py-3 text-right text-sm font-medium transition-colors font-iran-sans truncate",
                      isActive 
                        ? "bg-background text-primary border-r-2 border-primary" 
                        : "text-foreground hover:bg-muted/40"
                    )}
                  >
                    {province.name}
                  </button>
                );
              })}
            </div>

            {/* ستون شهرها */}
            <div className="flex-1 overflow-y-auto p-4 bg-background">
              {activeProvince ? (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-iran-sans font-bold block mb-3 pb-2 border-b">
                    شهرهای استان {activeProvince.name} ({activeProvince.cities.length} شهر)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {activeProvince.cities.map(city => (
                      <button
                        key={city.id}
                        onClick={() => handleSelectCity(city.id, city.name)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-right text-sm transition-all font-iran-sans truncate hover:border-primary/30",
                          selectedCity?.id === city.id 
                            ? "bg-primary/5 border-primary text-primary font-bold" 
                            : "hover:bg-muted/30 text-foreground"
                        )}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground font-iran-sans p-4">
                  استان مورد نظر را انتخاب کنید.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

  // حالت موبایل فلت (کلیک‌خور ردیفی و بدون کادر دکمه‌ای)
  if (isMobileVariant) {
    return (
      <>
        <div
          onClick={handleOpenModal}
          className="flex items-center justify-between w-full py-2.5 px-1 cursor-pointer hover:text-primary transition-colors text-xs text-muted-foreground font-iran-sans font-medium"
        >
          {/* سمت راست: آیکون لوکیشن + لیبل وضعیت شهر */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
            <span className="text-foreground font-bold text-sm">
              {selectedCity ? `موقعیت شما: ${selectedCity.name}` : 'انتخاب شهر (تعیین موقعیت)'}
            </span>
          </div>
          
          {/* سمت چپ: دکمه حذف موقعیت (در صورت انتخاب بودن) + نماد راهنمای < */}
          <div className="flex items-center gap-2" onClick={(e) => selectedCity && e.stopPropagation()}>
            {selectedCity && (
              <button
                onClick={handleClearCity}
                className="p-1 hover:text-destructive text-muted-foreground/80 transition-colors"
                aria-label="حذف انتخاب شهر"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </div>

        {renderModalContent()}
      </>
    );
  }

  // حالت دسکتاپ پیش‌فرض (کادر دکمه‌ای حاشیه‌دار)
  return (
    <>
      <button
        className="flex items-center gap-1.5 text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap bg-muted/40 hover:bg-muted/70 px-2.5 py-1.5 rounded-lg border"
        onClick={handleOpenModal}
        aria-label="انتخاب شهر"
      >
        <MapPin className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
        <span className="font-iran-sans font-medium text-foreground">
          {selectedCity ? selectedCity.name : 'انتخاب شهر'}
        </span>
        {selectedCity ? (
          <X 
            className="h-3 w-3 hover:text-destructive text-muted-foreground/80 transition-colors" 
            onClick={handleClearCity}
          />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {renderModalContent()}
    </>
  );
}