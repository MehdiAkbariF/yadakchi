// src/components/features/ProductGrid/SearchSidebar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGetBrandsName } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { useGetCarsName } from '@/domains/front/reference/car/hooks/car.hooks';
import { useGetPartsName, useGetPartCategories } from '@/domains/front/part/hooks/part.hooks';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Switch } from '@/components/primitives/Switch/Switch';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { PriceSlider } from '@/components/composites/PriceSlider/PriceSlider';
import { FilterList, FilterItem } from '@/components/composites/FilterList/FilterList';
import { Button } from '@/components/primitives/Button/Button';
import { Typography } from '@/components/primitives/Typography';
import { X, Filter, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { Modal } from '@/components/composites/Modal/Modal';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { toPersianDigits } from '@/core/utils/formatters';

interface AggregationBucket {
  key: string;
  count: number;
}

interface SearchAggregations {
  brands?: AggregationBucket[];
  parts?: AggregationBucket[];
  partCategories?: AggregationBucket[];
  cars?: AggregationBucket[];
  types?: AggregationBucket[];
  priceStats?: {
    min: number;
    max: number;
    avg?: number;
    sum?: number;
  };
}

interface SearchSidebarProps {
  filters: SearchProductsRequest;
  aggregations?: SearchAggregations | null;
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
  aggregations,
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
  const [categorySearch, setCategorySearch] = useState('');

  const relevantCategoryId =
    filters.partCategoryIds?.[0] ||
    (aggregations?.partCategories && aggregations.partCategories.length > 0
      ? aggregations.partCategories[0].key
      : undefined);

  // واکشی داده‌های پایه
  const { data: brandsList = [] } = useGetBrandsName({});
  const { data: carsList = [] } = useGetCarsName({});
  const { data: categoriesList = [] } = useGetPartCategories();
  const { data: partsData } = useGetPartsName({
    name: partSearch || filters.searchTitle || undefined,
    partCategoryId: relevantCategoryId,
    pageNumber: 1,
    pageSize: 100,
  });

  // نقشه‌های تجمیعی O(1)
  const brandAggMap = useMemo(() => {
    const map = new Map<string, number>();
    (aggregations?.brands || []).forEach((b) => map.set(String(b.key).toLowerCase(), b.count));
    return map;
  }, [aggregations?.brands]);

  const partAggMap = useMemo(() => {
    const map = new Map<string, number>();
    (aggregations?.parts || []).forEach((p) => map.set(String(p.key).toLowerCase(), p.count));
    return map;
  }, [aggregations?.parts]);

  const categoryAggMap = useMemo(() => {
    const map = new Map<string, number>();
    (aggregations?.partCategories || []).forEach((c) => map.set(String(c.key).toLowerCase(), c.count));
    return map;
  }, [aggregations?.partCategories]);

  const typeAggMap = useMemo(() => {
    const map = new Map<string, number>();
    (aggregations?.types || []).forEach((t) => {
      const k = String(t.key).toLowerCase();
      if (k === '1' || k === 'new') map.set('New', t.count);
      else if (k === '2' || k === 'stock') map.set('Stock', t.count);
      else if (k === '3' || k === 'takeoff') map.set('TakeOff', t.count);
    });
    return map;
  }, [aggregations?.types]);

  // ۱. فیلتر دسته‌بندی‌های قطعه (جدید طبق سواگر)
  const formattedCategories: FilterItem[] = useMemo(() => {
    const selectedCategoryIds = new Set((filters.partCategoryIds || []).map((id) => String(id).toLowerCase()));
    const hasCatAgg = categoryAggMap.size > 0;

    const items = categoriesList
      .filter((c: any) => {
        const idLower = String(c.id).toLowerCase();
        return !hasCatAgg || categoryAggMap.has(idLower) || selectedCategoryIds.has(idLower);
      })
      .map((c: any) => {
        const idLower = String(c.id).toLowerCase();
        return {
          id: c.id,
          name: c.name,
          count: categoryAggMap.get(idLower),
        };
      });

    if (categorySearch.trim()) {
      return items.filter((c: any) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    }
    return items;
  }, [categoriesList, categoryAggMap, filters.partCategoryIds, categorySearch]);

  // ۲. فیلتر برندها
  const formattedBrands: FilterItem[] = useMemo(() => {
    const selectedBrandIds = new Set((filters.brandIds || []).map((id) => String(id).toLowerCase()));
    const hasBrandAgg = brandAggMap.size > 0;

    const items = brandsList
      .filter((b: any) => {
        const idLower = String(b.id).toLowerCase();
        return !hasBrandAgg || brandAggMap.has(idLower) || selectedBrandIds.has(idLower);
      })
      .map((b: any) => {
        const idLower = String(b.id).toLowerCase();
        return {
          id: b.id,
          name: b.name,
          count: brandAggMap.get(idLower),
        };
      });

    if (brandSearch.trim()) {
      return items.filter((b: any) => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
    }
    return items;
  }, [brandsList, brandAggMap, filters.brandIds, brandSearch]);

  // ۳. فیلتر قطعات
  const allParts = partsData?.items || [];
  const formattedParts: FilterItem[] = useMemo(() => {
    const selectedPartIds = new Set((filters.partIds || []).map((id) => String(id).toLowerCase()));
    const hasPartAgg = partAggMap.size > 0;

    let items = allParts
      .filter((p: any) => {
        const idLower = String(p.id).toLowerCase();
        return !hasPartAgg || partAggMap.has(idLower) || selectedPartIds.has(idLower);
      })
      .map((p: any) => {
        const idLower = String(p.id).toLowerCase();
        return {
          id: p.id,
          name: p.name,
          count: partAggMap.get(idLower),
        };
      });

    if (items.length === 0 && hasPartAgg && aggregations?.parts) {
      items = aggregations.parts.map((p) => ({
        id: p.key,
        name: filters.searchTitle ? `قطعات مرتبط با «${filters.searchTitle}»` : 'قطعه مرتبط',
        count: p.count,
      }));
    }

    if (partSearch.trim()) {
      return items.filter((p: any) => p.name.toLowerCase().includes(partSearch.toLowerCase()));
    }
    return items;
  }, [allParts, partAggMap, filters.partIds, partSearch, aggregations?.parts, filters.searchTitle]);

  // ۴. فیلتر خودروها
  const formattedCars: FilterItem[] = useMemo(() => {
    const items = carsList.map((c: any) => ({
      id: c.id,
      name: c.displayName || c.model,
    }));

    if (carSearch.trim()) {
      return items.filter((c: any) => c.name.toLowerCase().includes(carSearch.toLowerCase()));
    }
    return items;
  }, [carsList, carSearch]);

  // کران‌های هوشمند قیمت
  const dynamicMinPrice = aggregations?.priceStats?.min ?? 50000;
  const dynamicMaxPrice = aggregations?.priceStats?.max ?? 100000000;

  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.fromPrice || dynamicMinPrice,
    filters.toPrice || dynamicMaxPrice,
  ]);

  useEffect(() => {
    setPriceRange([
      filters.fromPrice || dynamicMinPrice,
      filters.toPrice || dynamicMaxPrice,
    ]);
  }, [filters.fromPrice, filters.toPrice, dynamicMinPrice, dynamicMaxPrice]);

  const handleCheckboxChange = (name: string, id: string, checked: boolean) => {
    const currentList = (filters[name as keyof SearchProductsRequest] as string[]) || [];
    let updatedList = [...currentList];

    if (checked) {
      if (!updatedList.includes(id)) updatedList.push(id);
    } else {
      updatedList = updatedList.filter((item) => item !== id);
    }

    onFilterChange(name, updatedList.length ? updatedList : undefined);
  };

  const handleTypeChange = (type: 'New' | 'Stock' | 'TakeOff', checked: boolean) => {
    const currentTypes = (filters.types as string[]) || [];
    let updatedTypes = [...currentTypes];

    if (checked) {
      if (!updatedTypes.includes(type)) updatedTypes.push(type);
    } else {
      updatedTypes = updatedTypes.filter((t) => t !== type);
    }

    onFilterChange('types', updatedTypes.length ? updatedTypes : undefined);
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.onlyInStock ||
      filters.onlyDiscounted ||
      filters.onlyDirectShipping ||
      filters.onlyNominated ||
      filters.fromPrice ||
      filters.toPrice ||
      filters.brandIds?.length ||
      filters.carIds?.length ||
      filters.partCategoryIds?.length ||
      filters.partIds?.length ||
      filters.types?.length
    );
  }, [filters]);

  const activeTypesCount = filters.types?.length || 0;
  const activeCategoriesCount = filters.partCategoryIds?.length || 0;
  const activePartsCount = filters.partIds?.length || 0;
  const activeBrandsCount = filters.brandIds?.length || 0;
  const activeCarsCount = filters.carIds?.length || 0;
  const isPriceFilterActive = !!(filters.fromPrice || filters.toPrice);

  const formatCount = (count: number) => {
    return count > 0 ? ` (${toPersianDigits(count)})` : '';
  };

  const renderFilterContent = (isMobile: boolean) => (
    <div className={cn('flex w-full flex-col gap-4', isMobile && 'pb-24')} dir="rtl">
      {/* سوییچ‌های دسترسی سریع کاملاً منطبق بر سواگر */}
      <div className="flex flex-col gap-3.5 border-b border-border/80 pb-4">
        {/* ۱. فقط کالاهای موجود (onlyInStock) */}
        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">فقط کالاهای موجود</span>
          <Switch
            checked={!!filters.onlyInStock}
            onChange={(checked) => onFilterChange('inStock', checked ? true : undefined)}
          />
        </div>

        {/* ۲. دارای تخفیف ویژه (onlyDiscounted) */}
        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">دارای تخفیف ویژه</span>
          <Switch
            checked={!!filters.onlyDiscounted}
            onChange={(checked) => onFilterChange('discount', checked ? true : undefined)}
          />
        </div>

        {/* ۳. ارسال مستقیم / تحویل فوری (onlyDirectShipping) - جدید طبق سواگر */}
        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">ارسال مستقیم از فروشنده</span>
          <Switch
            checked={!!filters.onlyDirectShipping}
            onChange={(checked) => onFilterChange('directShipping', checked ? true : undefined)}
          />
        </div>

        {/* ۴. فقط کالاهای برگزیده (onlyNominated) - جدید طبق سواگر */}
        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">فقط کالاهای برگزیده</span>
          <Switch
            checked={!!filters.onlyNominated}
            onChange={(checked) => onFilterChange('nominated', checked ? true : undefined)}
          />
        </div>
      </div>

      {/* نوع قطعه */}
      <Accordion title={`نوع قطعه${formatCount(activeTypesCount)}`} defaultOpen={activeTypesCount > 0}>
        <div className="flex flex-col gap-2.5 pe-1 pt-1 text-xs">
          <Checkbox
            label="همه قطعات"
            checked={!filters.types || filters.types.length === 0}
            onChange={(checked) => checked && onFilterChange('types', undefined)}
          />
          <Checkbox
            label={`نو ${typeAggMap.get('New') ? `(${toPersianDigits(typeAggMap.get('New'))})` : ''}`}
            checked={((filters.types as string[]) || []).includes('New')}
            onChange={(checked) => handleTypeChange('New', checked)}
          />
          <Checkbox
            label={`استوک ${typeAggMap.get('Stock') ? `(${toPersianDigits(typeAggMap.get('Stock'))})` : ''}`}
            checked={((filters.types as string[]) || []).includes('Stock')}
            onChange={(checked) => handleTypeChange('Stock', checked)}
          />
          <Checkbox
            label={`زیرصفری ${typeAggMap.get('TakeOff') ? `(${toPersianDigits(typeAggMap.get('TakeOff'))})` : ''}`}
            checked={((filters.types as string[]) || []).includes('TakeOff')}
            onChange={(checked) => handleTypeChange('TakeOff', checked)}
          />
        </div>
      </Accordion>

      {/* انتخاب دسته‌بندی قطعه (جدید طبق سواگر) */}
      {formattedCategories.length > 0 && (
        <Accordion title={`دسته‌بندی قطعه${formatCount(activeCategoriesCount)}`} defaultOpen={activeCategoriesCount > 0}>
          <FilterList
            items={formattedCategories}
            selectedIds={(filters.partCategoryIds as string[]) || []}
            onChange={(id, checked) => handleCheckboxChange('partCategoryIds', id, checked)}
            searchPlaceholder="جستجوی دسته‌بندی..."
            onSearchChange={(query) => setCategorySearch(query)}
          />
        </Accordion>
      )}

      {/* انتخاب نام قطعه */}
      {!hidePartFilter && (
        <Accordion title={`قطعه${formatCount(activePartsCount)}`} defaultOpen={activePartsCount > 0}>
          <FilterList
            items={formattedParts}
            selectedIds={(filters.partIds as string[]) || []}
            onChange={(id, checked) => handleCheckboxChange('partIds', id, checked)}
            searchPlaceholder="جستجوی نام قطعه..."
            onSearchChange={(query) => setPartSearch(query)}
          />
        </Accordion>
      )}

      {/* انتخاب برند */}
      <Accordion title={`برند قطعه${formatCount(activeBrandsCount)}`} defaultOpen={activeBrandsCount > 0}>
        <FilterList
          items={formattedBrands}
          selectedIds={(filters.brandIds as string[]) || []}
          onChange={(id, checked) => handleCheckboxChange('brandIds', id, checked)}
          searchPlaceholder="جستجوی برند..."
          onSearchChange={(query) => setBrandSearch(query)}
        />
      </Accordion>

      {/* انتخاب مدل خودرو */}
      <Accordion title={`مدل خودرو${formatCount(activeCarsCount)}`} defaultOpen={activeCarsCount > 0}>
        <FilterList
          items={formattedCars}
          selectedIds={(filters.carIds as string[]) || []}
          onChange={(id, checked) => handleCheckboxChange('carIds', id, checked)}
          searchPlaceholder="جستجوی مدل خودرو..."
          onSearchChange={(query) => setCarSearch(query)}
        />
      </Accordion>

      {/* فیلتر قیمت */}
      <Accordion title={isPriceFilterActive ? 'محدوده قیمت (فعال)' : 'محدوده قیمت'} defaultOpen={isPriceFilterActive}>
        <PriceSlider
          min={dynamicMinPrice}
          max={dynamicMaxPrice}
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
      <aside
        style={{
          top: 'calc(var(--header-height, 108px) + 0.75rem)',
          maxHeight: 'calc(100vh - var(--header-height, 108px) - 1.5rem)',
        }}
        className="hidden lg:flex w-[18rem] shrink-0 sticky flex-col gap-4 overflow-y-auto scrollbar-thin select-none"
        dir="rtl"
      >
        <ShopProductAdBanner
          carId={carId}
          partCategoryId={partCategoryId}
          partId={partId}
        />

        <div className="h-fit w-full rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="mb-4 flex w-full select-none items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <Typography variant="h5" className="font-bold text-foreground">
                فیلترها
              </Typography>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-bold text-destructive transition-colors hover:underline"
              >
                حذف همه
              </button>
            )}
          </div>
          {renderFilterContent(false)}
        </div>
      </aside>

      {/* دراور موبایل */}
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
              aria-label="بستن پنجره"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="flex items-center gap-1.5 text-xs font-bold sm:text-sm">
              <Filter className="h-4 w-4 text-primary" />
              فیلترها
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="بستن پنجره"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-4 scrollbar-thin" dir="rtl">
          {renderFilterContent(true)}
        </div>

        <div className="sticky bottom-0 right-0 left-0 z-sticky flex shrink-0 gap-3 border-t border-border bg-card p-4 shadow-lg" dir="rtl">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="h-10 flex-1 rounded-xl border-destructive/20 text-xs font-bold text-destructive hover:bg-destructive/5"
            >
              حذف فیلترها
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="h-10 flex-1 rounded-xl text-xs font-bold"
          >
            مشاهده نتایج
          </Button>
        </div>
      </Modal>
    </>
  );
}