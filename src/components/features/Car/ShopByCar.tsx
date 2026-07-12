// src/components/features/Car/ShopByCar.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCarListFlat } from '@/domains/front/reference/car/hooks/car.hooks';
import { Modal, ModalHeader, ModalTitle, ModalBody } from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Input } from '@/components/primitives/Input/Input';
import { Typography } from '@/components/primitives/Typography';
import { Car, Search, Loader2, ArrowRight, X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

interface CarItem {
  id: string;
  model: string;
  englishTitle: string;
  cover: string;
  coverAlt: string | null;
}

export function ShopByCar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // دریافت اطلاعات خودروها
  const { data: cars = [], isLoading } = useGetCarListFlat(1, 200);

  // هماهنگی با کلید Back فیزیکی گوشی اندروید و مرورگر
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      setIsOpen(false);
    };

    window.history.pushState({ modalOpen: 'car-selector' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);

  // بهینه‌سازی مرجع تابع با useCallback برای ممانعت از بازنشانی مجدد فوکوس مودال در زمان تایپ
  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
    if (window.history.state?.modalOpen === 'car-selector') {
      window.history.back();
    }
  }, []);

  const getFullUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const handleSearchSubmit = () => {
    if (selectedCar) {
      router.push(`/search?carId=${selectedCar.id}`);
    }
  };

  // فیلتر کردن هوشمند خودروها
  const filteredCars = cars.filter((car: CarItem) =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.englishTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col items-center py-1 md:py-4 gap-2.5">
      
      {/* عنوان بالای دکمه‌ها */}
      <Typography variant="h4" className="font-iran-yekan font-bold text-center text-foreground/90 text-sm sm:text-base md:text-lg">
        خرید بر اساس خودرو
      </Typography>

      {/* کانتینر دکمه‌ها */}
      <div className="flex flex-col sm:flex-row items-stretch w-full max-w-2xl gap-3 px-4 sm:px-0">
        
        {/* دکمه انتخاب خودرو */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center justify-between border rounded-xl px-4 py-3 bg-background hover:border-primary/40 transition-colors text-right outline-none shadow-sm h-12"
        >
          {selectedCar ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <img
                src={getFullUrl(selectedCar.cover)}
                alt={selectedCar.model}
                className="w-10 h-7 object-contain rounded-md"
              />
              <span className="text-sm font-bold font-iran-sans text-foreground">{selectedCar.model}</span>
            </div>
          ) : (
            <span className="text-sm font-medium font-iran-sans text-muted-foreground">مدل خودروی خود را انتخاب کنید...</span>
          )}
          <Car className="h-4 w-4 text-muted-foreground shrink-0 mr-2" />
        </button>

        {/* دکمه جستجو قطعات */}
        <Button
          variant="primary"
          onClick={handleSearchSubmit}
          disabled={!selectedCar}
          className="px-8 font-iran-sans font-bold text-sm h-12 rounded-xl shrink-0 shadow-sm"
          leftIcon={<Search className="h-4 w-4" />}
        >
          جستجوی قطعات
        </Button>
      </div>

      {/* مودال واکنش‌گرا و بهینه‌شده انتخاب خودرو */}
      <Modal 
        isOpen={isOpen} 
        onClose={handleCloseModal} 
        className="w-full h-full max-h-full max-w-none p-0 rounded-none flex flex-col fixed inset-0 z-50 bg-background md:relative md:max-w-2xl md:h-[550px] md:max-h-[90vh] md:rounded-xl md:overflow-hidden"
        overlayClassName="bg-black/40 backdrop-blur-md"
      >
        {/* هدر مودال همراه با دکمه بازگشت برای کلاینت‌های موبایل */}
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
              <Car className="h-4 w-4 text-primary" />
              انتخاب خودرو
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

        {/* فیلد جستجوی بدون پرش فوکوس */}
        <div className="p-4 border-b bg-background shrink-0">
          <Input
            placeholder="جستجوی مدل خودرو (مثال: پراید، تارا...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full font-iran-sans"
          />
        </div>

        <ModalBody className="flex-1 overflow-y-auto p-6 bg-background">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <Typography variant="small" color="muted" className="font-iran-sans">در حال لود لیست خودروها...</Typography>
            </div>
          ) : filteredCars.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredCars.map((car: CarItem) => (
                <div
                  key={car.id}
                  onClick={() => {
                    setSelectedCar(car);
                    handleCloseModal();
                  }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center group",
                    selectedCar?.id === car.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                  )}
                >
                  <div className="w-full aspect-[4/3] relative overflow-hidden rounded-lg">
                    <img
                      src={getFullUrl(car.cover)}
                      alt={car.model}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold font-iran-sans text-foreground">{car.model}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Typography variant="small" color="muted" className="font-iran-sans">خودرویی با مشخصات مدنظر یافت نشد.</Typography>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}