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

interface SearchSidebarProps {
  filters: SearchProductsRequest;
  onFilterChange: (name: string, value: any) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  hidePartFilter?: boolean;
}

export function SearchSidebar({
  filters,
  onFilterChange,
  onClearAll,
  isOpen,
  onClose,
  hidePartFilter = false,
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
      filters.toPrice || 100000000
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
      updatedList = updatedList.filter(item => item !== id);
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
      updatedTypes = updatedTypes.filter(t => t !== type);
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
    <div className={cn("w-full flex flex-col gap-5 text-right", isMobile && "pb-24")}>
      <div className="flex flex-col gap-4 border-b pb-4">
        <div className="flex items-center justify-between w-full select-none">
          <span className="text-xs font-bold font-iran-sans text-foreground">فقط کالاهای موجود</span>
          <Switch
            checked={!!filters.isProductInStock}
            onChange={(checked) => onFilterChange('inStock', checked ? true : undefined)}
          />
        </div>

        <div className="flex items-center justify-between w-full select-none">
          <span className="text-xs font-bold font-iran-sans text-foreground">فقط فروشنده‌های شهر من</span>
          <Switch
            checked={!!filters.isSellerInUserCity}
            onChange={(checked) => onFilterChange('userCity', checked ? true : undefined)}
          />
        </div>

        <div className="flex items-center justify-between w-full select-none">
          <span className="text-xs font-bold font-iran-sans text-foreground">دارای تخفیف ویژه</span>
          <Switch
            checked={!!filters.hasDiscount}
            onChange={(checked) => onFilterChange('discount', checked ? true : undefined)}
          />
        </div>
      </div>

      <Accordion title={`نوع قطعه${formatCount(activeTypesCount)}`} defaultOpen={activeTypesCount > 0}>
        <div className="flex flex-col gap-2 pt-1 pr-1">
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
            onLoadMore={() => setPartPage(prev => prev + 1)}
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

      <Accordion title={isPriceFilterActive ? "محدوده قیمت (فعال)" : "محدوده قیمت"} defaultOpen={isPriceFilterActive}>
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
      <div className="hidden lg:flex flex-col w-[280px] shrink-0 border rounded-xl p-5 bg-background shadow-sm h-fit">
        <div className="flex items-center justify-between border-b pb-3 mb-4 select-none w-full">
          <div className="flex items-center gap-2 text-right">
            <Filter className="h-4.5 w-4.5 text-primary" />
            <Typography variant="h5" className="font-iran-yekan font-extrabold text-foreground">فیلترها</Typography>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-xs font-bold font-iran-sans text-destructive hover:underline"
            >
              حذف فیلترها
            </button>
          )}
        </div>
        {renderFilterContent(false)}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="w-full h-full max-h-full max-w-none p-0 rounded-none flex flex-col fixed inset-0 z-[80] bg-background"
        overlayClassName="bg-black/40 backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-1 -mr-1 hover:bg-muted rounded-full"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              فیلترها
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 relative">
          {renderFilterContent(true)}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4 flex gap-3 shrink-0 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="flex-1 rounded-xl text-xs font-bold font-iran-sans text-destructive border-destructive/20 hover:bg-destructive/5 h-10"
            >
              حذف فیلترها
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="flex-1 rounded-xl text-xs font-bold font-iran-sans h-10"
          >
            مشاهده نتایج
          </Button>
        </div>
      </Modal>
    </>
  );
}