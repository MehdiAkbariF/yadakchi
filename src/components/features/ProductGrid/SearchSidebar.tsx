// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\features\ProductGrid\SearchSidebar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGetBrandsName } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { useGetCarsName } from '@/domains/front/reference/car/hooks/car.hooks';
import { useGetPartsName } from '@/domains/front/part/hooks/part.hooks';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Switch } from '@/components/primitives/Switch/Switch';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { PriceSlider } from '@/components/composites/PriceSlider/PriceSlider';
import { FilterList } from '@/components/composites/FilterList/FilterList';
import { Button } from '@/components/primitives/Button/Button';
import { Typography } from '@/components/primitives/Typography';
import { X, Filter, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { Modal } from '@/components/composites/Modal/Modal';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';

interface SearchSidebarProps {
  filters: SearchProductsRequest;
  onFilterChange: (name: string, value: any) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  hidePartFilter?: boolean;
  carId?: string;
  partCategoryId?: string;
  partId?: string;
}

export function SearchSidebar({
  filters,
  onFilterChange,
  onClearAll,
  isOpen,
  onClose,
  hidePartFilter = false,
  carId,
  partCategoryId,
  partId,
}: SearchSidebarProps) {
  const [brandSearch, setBrandSearch] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [partSearch, setPartSearch] = useState('');

  const [partPage, setPartPage] = useState(1);
  const [accumulatedParts, setAccumulatedParts] = useState<any[]>([]);

  const { data: brandsList = [] } = useGetBrandsName({
    searchTerm: brandSearch || undefined,
  });

  const { data: carsList = [] } = useGetCarsName({
    model: carSearch || undefined,
  });

  const { data: partsData, isLoading: isPartsLoading } = useGetPartsName({
    name: partSearch || undefined,
    pageNumber: partPage,
    pageSize: 30,
  });

  const hasMoreParts = partsData ? partPage < partsData.totalPages : false;

  useEffect(() => {
    setPartPage(1);
    setAccumulatedParts([]);
  }, [partSearch]);

  useEffect(() => {
    if (partPage === 1) {
      setAccumulatedParts(partsData?.items || []);
    } else if (partsData?.items) {
      setAccumulatedParts((prev) => [...prev, ...partsData.items]);
    }
  }, [partsData, partPage]);

  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 100000000]);

  useEffect(() => {
    setPriceRange([
      filters.fromPrice || 500000,
      filters.toPrice || 100000000,
    ]);
  }, [filters.fromPrice, filters.toPrice]);

  const handleCheckboxChange = (name: string, id: string, checked: boolean) => {
    const currentList = (filters[name as keyof SearchProductsRequest] as string[]) || [];
    let updatedList = [...currentList];

    if (checked) {
      if (!updatedList.includes(id)) {
        updatedList.push(id);
      }
    } else {
      updatedList = updatedList.filter((item) => item !== id);
    }

    onFilterChange(name, updatedList.length ? updatedList : undefined);
  };

  const handleTypeChange = (type: 'New' | 'Stock' | 'TakeOff', checked: boolean) => {
    const currentTypes = (filters.types as string[]) || [];
    let updatedTypes = [...currentTypes];

    if (checked) {
      if (!updatedTypes.includes(type)) {
        updatedTypes.push(type);
      }
    } else {
      updatedTypes = updatedTypes.filter((t) => t !== type);
    }

    onFilterChange('types', updatedTypes.length ? updatedTypes : undefined);
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.isProductInStock ||
      filters.isSellerInUserCity ||
      filters.hasDiscount ||
      filters.fromPrice ||
      filters.toPrice ||
      filters.brandIds?.length ||
      filters.carIds?.length ||
      filters.partIds?.length ||
      filters.types?.length
    );
  }, [filters]);

  const formattedBrands = brandsList.map((b: any) => ({ id: b.id, name: b.name }));
  const formattedCars = carsList.map((c: any) => ({ id: c.id, name: c.displayName || c.model }));
  const formattedParts = accumulatedParts.map((p: any) => ({ id: p.id, name: p.name }));

  const activeTypesCount = filters.types?.length || 0;
  const activePartsCount = filters.partIds?.length || 0;
  const activeBrandsCount = filters.brandIds?.length || 0;
  const activeCarsCount = filters.carIds?.length || 0;
  const isPriceFilterActive = !!(filters.fromPrice || filters.toPrice);

  const formatCount = (count: number) => {
    return count > 0 ? ` (${new Intl.NumberFormat('fa-IR').format(count)})` : '';
  };

  const renderFilterContent = (isMobile: boolean) => (
    <div className={cn('flex w-full flex-col gap-5', isMobile && 'pb-24')} dir="rtl">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-bold text-foreground">فقط کالاهای موجود</span>
          <Switch
            checked={!!filters.isProductInStock}
            onChange={(checked) => onFilterChange('inStock', checked ? true : undefined)}
          />
        </div>

        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-bold text-foreground">فقط فروشنده‌های شهر من</span>
          <Switch
            checked={!!filters.isSellerInUserCity}
            onChange={(checked) => onFilterChange('userCity', checked ? true : undefined)}
          />
        </div>

        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-bold text-foreground">دارای تخفیف ویژه</span>
          <Switch
            checked={!!filters.hasDiscount}
            onChange={(checked) => onFilterChange('discount', checked ? true : undefined)}
          />
        </div>
      </div>

      <Accordion title={`نوع قطعه${formatCount(activeTypesCount)}`} defaultOpen={activeTypesCount > 0}>
        <div className="flex flex-col gap-2 pe-1 pt-1">
          <Checkbox
            label="همه قطعات"
            checked={!filters.types || filters.types.length === 0}
            onChange={(checked) => checked && onFilterChange('types', undefined)}
          />
          <Checkbox
            label="نو"
            checked={((filters.types as string[]) || []).includes('New')}
            onChange={(checked) => handleTypeChange('New', checked)}
          />
          <Checkbox
            label="استوک"
            checked={((filters.types as string[]) || []).includes('Stock')}
            onChange={(checked) => handleTypeChange('Stock', checked)}
          />
          <Checkbox
            label="زیرصفری"
            checked={((filters.types as string[]) || []).includes('TakeOff')}
            onChange={(checked) => handleTypeChange('TakeOff', checked)}
          />
        </div>
      </Accordion>

      {!hidePartFilter && (
        <Accordion title={`قطعه${formatCount(activePartsCount)}`} defaultOpen={activePartsCount > 0}>
          <FilterList
            items={formattedParts}
            selectedIds={(filters.partIds as string[]) || []}
            onChange={(id, checked) => handleCheckboxChange('partIds', id, checked)}
            searchPlaceholder="جستجوی نام قطعه..."
            onSearchChange={(query) => {
              setPartSearch(query);
            }}
            onLoadMore={() => setPartPage((prev) => prev + 1)}
            hasMore={hasMoreParts}
            isLoadingMore={isPartsLoading}
          />
        </Accordion>
      )}

      <Accordion title={`برند قطعه${formatCount(activeBrandsCount)}`} defaultOpen={activeBrandsCount > 0}>
        <FilterList
          items={formattedBrands}
          selectedIds={(filters.brandIds as string[]) || []}
          onChange={(id, checked) => handleCheckboxChange('brandIds', id, checked)}
          searchPlaceholder="جستجوی برند..."
          onSearchChange={(query) => {
            setBrandSearch(query);
          }}
        />
      </Accordion>

      <Accordion title={`مدل خودرو${formatCount(activeCarsCount)}`} defaultOpen={activeCarsCount > 0}>
        <FilterList
          items={formattedCars}
          selectedIds={(filters.carIds as string[]) || []}
          onChange={(id, checked) => handleCheckboxChange('carIds', id, checked)}
          searchPlaceholder="جستجوی مدل خودرو..."
          onSearchChange={(query) => {
            setCarSearch(query);
          }}
        />
      </Accordion>

      <Accordion title={isPriceFilterActive ? 'محدوده قیمت (فعال)' : 'محدوده قیمت'} defaultOpen={isPriceFilterActive}>
        <PriceSlider
          min={500000}
          max={100000000}
          value={priceRange}
          onChange={(val) => setPriceRange(val)}
          onApply={() => {
            onFilterChange('fromPrice', priceRange[0]);
            onFilterChange('toPrice', priceRange[1]);
          }}
        />
      </Accordion>
    </div>
  );

  return (
    <>
      {/* سایدبار دسکتاپ: بنر تبلیغاتی + کارت فیلترها */}
      <div className="hidden lg:flex w-[280px] shrink-0 flex-col gap-5" dir="rtl">
        <ShopProductAdBanner
          carId={carId}
          partCategoryId={partCategoryId}
          partId={partId}
        />

        <div className="h-fit w-full rounded-lg border border-border bg-card p-5 shadow-xs">
          <div className="mb-4 flex w-full select-none items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4.5 w-4.5 text-primary" />
              <Typography variant="h5" className="font-extrabold text-foreground">
                فیلترها
              </Typography>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-bold text-destructive transition-colors hover:underline"
              >
                حذف فیلترها
              </button>
            )}
          </div>
          {renderFilterContent(false)}
        </div>
      </div>

      {/* مودال فیلترهای موبایل */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-modal flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0"
        overlayClassName="bg-black/40 backdrop-blur-sm"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/20 px-4 py-3.5" dir="rtl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-foreground transition-colors hover:bg-muted"
              aria-label="بستن"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              فیلترها
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-5" dir="rtl">
          {renderFilterContent(true)}
        </div>

        <div className="absolute bottom-0 right-0 left-0 z-sticky flex shrink-0 gap-3 border-t border-border bg-card p-4 shadow-md" dir="rtl">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="h-10 flex-1 rounded-md border-destructive/20 text-xs font-bold text-destructive hover:bg-destructive/5"
            >
              حذف فیلترها
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="h-10 flex-1 rounded-md text-xs font-bold"
          >
            مشاهده نتایج
          </Button>
        </div>
      </Modal>
    </>
  );
}