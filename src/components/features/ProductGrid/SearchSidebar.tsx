
'use client';

import { useState, useEffect, useMemo } from 'react';

import { useGetBrandsName } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { useGetCarsName } from '@/domains/front/reference/car/hooks/car.hooks';
import {
  useGetPartsName,
  useGetPartCategories,
} from '@/domains/front/part/hooks/part.hooks';

import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Switch } from '@/components/primitives/Switch/Switch';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { PriceSlider } from '@/components/composites/PriceSlider/PriceSlider';
import {
  FilterList,
  FilterItem,
} from '@/components/composites/FilterList/FilterList';
import { Button } from '@/components/primitives/Button/Button';
import { Typography } from '@/components/primitives/Typography';
import { X, Filter, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { Modal } from '@/components/composites/Modal/Modal';
import { ShopProductAdBanner } from '@/components/features/ProductCard/ShopProductAdBanner';
import { toPersianDigits } from '@/core/utils/formatters';

// ============================================================
// Types
// ============================================================

interface AggregationBucket {
  key: string;
  count: number;
}

interface SearchAggregations {
  brands?: AggregationBucket[];
  parts?: AggregationBucket[];
  partCategories?: AggregationBucket[];
  carIds?: AggregationBucket[];
  cars?: AggregationBucket[];
  types?: AggregationBucket[];

  priceStats?: {
    min: number;
    max: number;
    avg?: number;
    sum?: number;
  };
}

interface AggregationMemoryBank {
  brands: Map<string, number>;
  parts: Map<string, number>;
  categories: Map<string, number>;
  cars: Map<string, number>;
  types: Map<string, number>;
}

interface PersistedAggregationMemory {
  version: 1;
  savedAt: number;
  data: {
    brands: [string, number][];
    parts: [string, number][];
    categories: [string, number][];
    cars: [string, number][];
    types: [string, number][];
  };
}

interface AggregationMemoryState {
  scopeKey: string;
  bank: AggregationMemoryBank;
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

// ============================================================
// Configuration
// ============================================================

const MEMORY_STORAGE_PREFIX = 'product-search-aggregation:v1:';

// اعتبار Cache: 24 ساعت
const MEMORY_TTL = 24 * 60 * 60 * 1000;

// ============================================================
// Memory Utilities
// ============================================================

function createEmptyMemoryBank(): AggregationMemoryBank {
  return {
    brands: new Map(),
    parts: new Map(),
    categories: new Map(),
    cars: new Map(),
    types: new Map(),
  };
}

function normalizeKey(value: unknown): string {
  return String(value).toLowerCase();
}

function getMemoryStorageKey(scopeKey: string): string {
  return `${MEMORY_STORAGE_PREFIX}${encodeURIComponent(scopeKey)}`;
}

/**
 * خواندن حافظه از localStorage
 *
 * در SSR یا در صورت خراب بودن اطلاعات ذخیره‌شده،
 * یک حافظه خالی برمی‌گرداند.
 */
function readAggregationMemory(
  scopeKey: string
): AggregationMemoryBank {
  const empty = createEmptyMemoryBank();

  if (typeof window === 'undefined') {
    return empty;
  }

  try {
    const storageKey = getMemoryStorageKey(scopeKey);
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return empty;
    }

    const parsed = JSON.parse(raw) as PersistedAggregationMemory;

    // بررسی نسخه ساختار
    if (parsed.version !== 1 || !parsed.data) {
      window.localStorage.removeItem(storageKey);
      return empty;
    }

    // بررسی انقضای Cache
    if (
      !parsed.savedAt ||
      Date.now() - parsed.savedAt > MEMORY_TTL
    ) {
      window.localStorage.removeItem(storageKey);
      return empty;
    }

    const restoreMap = (
      entries: unknown
    ): Map<string, number> => {
      if (!Array.isArray(entries)) {
        return new Map();
      }

      const result = new Map<string, number>();

      for (const entry of entries) {
        if (
          !Array.isArray(entry) ||
          entry.length !== 2 ||
          typeof entry[0] !== 'string' ||
          typeof entry[1] !== 'number' ||
          !Number.isFinite(entry[1])
        ) {
          continue;
        }

        result.set(normalizeKey(entry[0]), entry[1]);
      }

      return result;
    };

    return {
      brands: restoreMap(parsed.data.brands),
      parts: restoreMap(parsed.data.parts),
      categories: restoreMap(parsed.data.categories),
      cars: restoreMap(parsed.data.cars),
      types: restoreMap(parsed.data.types),
    };
  } catch (error) {
    console.error(
      '[SearchSidebar] Failed to restore aggregation memory:',
      error
    );

    return empty;
  }
}

/**
 * ذخیره حافظه در localStorage
 */
function persistAggregationMemory(
  scopeKey: string,
  bank: AggregationMemoryBank
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: PersistedAggregationMemory = {
      version: 1,
      savedAt: Date.now(),

      data: {
        brands: Array.from(bank.brands.entries()),
        parts: Array.from(bank.parts.entries()),
        categories: Array.from(bank.categories.entries()),
        cars: Array.from(bank.cars.entries()),
        types: Array.from(bank.types.entries()),
      },
    };

    window.localStorage.setItem(
      getMemoryStorageKey(scopeKey),
      JSON.stringify(payload)
    );
  } catch (error) {
    // ممکن است Storage پر باشد یا دسترسی مرورگر محدود شده باشد.
    console.error(
      '[SearchSidebar] Failed to persist aggregation memory:',
      error
    );
  }
}

/**
 * ترکیب Aggregation جدید سرور با حافظه قبلی
 *
 * اطلاعات جدید جایگزین مقادیر قبلی همان کلید می‌شوند.
 * کلیدهایی که در پاسخ جدید وجود ندارند حفظ می‌شوند.
 */
function mergeAggregations(
  previous: AggregationMemoryBank,
  aggregations: SearchAggregations
): AggregationMemoryBank {
  const next: AggregationMemoryBank = {
    brands: new Map(previous.brands),
    parts: new Map(previous.parts),
    categories: new Map(previous.categories),
    cars: new Map(previous.cars),
    types: new Map(previous.types),
  };

  (aggregations.brands || []).forEach((item) => {
    next.brands.set(normalizeKey(item.key), item.count);
  });

  (aggregations.parts || []).forEach((item) => {
    next.parts.set(normalizeKey(item.key), item.count);
  });

  (aggregations.partCategories || []).forEach((item) => {
    next.categories.set(normalizeKey(item.key), item.count);
  });

  const carSource = aggregations.carIds || aggregations.cars || [];

  carSource.forEach((item) => {
    next.cars.set(normalizeKey(item.key), item.count);
  });

  (aggregations.types || []).forEach((item) => {
    const key = normalizeKey(item.key);

    if (key === '1' || key === 'new') {
      next.types.set('new', item.count);
    } else if (key === '2' || key === 'stock') {
      next.types.set('stock', item.count);
    } else if (key === '3' || key === 'takeoff') {
      next.types.set('takeoff', item.count);
    }
  });

  return next;
}

// ============================================================
// Component
// ============================================================

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
  // ==========================================================
  // Search states
  // ==========================================================

  const [brandSearch, setBrandSearch] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [partSearch, setPartSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // ==========================================================
  // Aggregation scope
  // ==========================================================

  /**
   * هر جستجو حافظه مستقل دارد.
   *
   * تغییر Search باعث پاک شدن Cache قبلی نمی‌شود.
   * در صورت بازگشت به همان جستجو، Cache قبلی بازیابی می‌شود.
   */
  const aggregationScopeKey = useMemo(() => {
    return JSON.stringify({
      searchTitle: filters.searchTitle || '',
      partCategoryEnglishTitle:
        filters.partCategoryEnglishTitle || '',
      carId: carId || '',
      partCategoryId: partCategoryId || '',
      partId: partId || '',
    });
  }, [
    filters.searchTitle,
    filters.partCategoryEnglishTitle,
    carId,
    partCategoryId,
    partId,
  ]);

  // ==========================================================
  // API queries
  // ==========================================================

  const relevantCategoryId =
    filters.partCategoryIds?.[0] ||
    (
      aggregations?.partCategories &&
      aggregations.partCategories.length > 0
        ? aggregations.partCategories[0].key
        : undefined
    );

  const { data: brandsList = [] } = useGetBrandsName({});

  const { data: carsList = [] } = useGetCarsName({});

  const { data: categoriesList = [] } = useGetPartCategories();

  const { data: partsData } = useGetPartsName({
    name: partSearch || filters.searchTitle || undefined,
    partCategoryId: relevantCategoryId,
    pageNumber: 1,
    pageSize: 100,
  });

  // ==========================================================
  // Persistent Aggregation Memory
  // ==========================================================

  /**
   * State به scope خودش وابسته است.
   *
   * این ساختار مانع می‌شود اطلاعات یک جستجو
   * اشتباهاً در جستجوی دیگر نمایش داده شوند.
   *
   * مقدار اولیه خالی است تا SSR و Hydration
   * با localStorage اختلاف نداشته باشند.
   */

  const [memoryState, setMemoryState] =
    useState<AggregationMemoryState>(() => ({
      scopeKey: '',
      bank: createEmptyMemoryBank(),
    }));

  /**
   * بازیابی حافظه هنگام ورود یا تغییر محدوده جستجو
   */
  useEffect(() => {
    const restoredMemory =
      readAggregationMemory(aggregationScopeKey);

    setMemoryState({
      scopeKey: aggregationScopeKey,
      bank: restoredMemory,
    });
  }, [aggregationScopeKey]);

  /**
   * ذخیره تغییرات حافظه
   *
   * فقط زمانی ذخیره می‌کنیم که حافظه متعلق به
   * محدوده جستجوی فعلی باشد.
   *
   * این شرط از ذخیره اطلاعات جستجوی قبلی
   * تحت کلید جستجوی جدید جلوگیری می‌کند.
   */
  useEffect(() => {
    if (memoryState.scopeKey !== aggregationScopeKey) {
      return;
    }

    persistAggregationMemory(
      aggregationScopeKey,
      memoryState.bank
    );
  }, [memoryState, aggregationScopeKey]);

  /**
   * دریافت و ترکیب Aggregation جدید
   */
  useEffect(() => {
    if (!aggregations) {
      return;
    }

    setMemoryState((previous) => {
      // جلوگیری از ورود اطلاعات به Scope اشتباه
      if (previous.scopeKey !== aggregationScopeKey) {
        return previous;
      }

      return {
        scopeKey: aggregationScopeKey,
        bank: mergeAggregations(
          previous.bank,
          aggregations
        ),
      };
    });
  }, [aggregations, aggregationScopeKey]);

  /**
   * حافظه قابل استفاده برای رندر
   */
  const memoryBank =
    memoryState.scopeKey === aggregationScopeKey
      ? memoryState.bank
      : createEmptyMemoryBank();

  const brandAggMap = memoryBank.brands;
  const partAggMap = memoryBank.parts;
  const categoryAggMap = memoryBank.categories;
  const carAggMap = memoryBank.cars;
  const typeAggMap = memoryBank.types;

  // ==========================================================
  // Categories
  // ==========================================================

  const formattedCategories: FilterItem[] = useMemo(() => {
    const selectedIds = new Set(
      (filters.partCategoryIds || []).map(normalizeKey)
    );

    const items = categoriesList
      .filter((category: any) => {
        const id = normalizeKey(category.id);

        return (
          categoryAggMap.has(id) ||
          selectedIds.has(id)
        );
      })
      .map((category: any) => ({
        id: category.id,
        name: category.name,
        count:
          categoryAggMap.get(normalizeKey(category.id)) || 0,
      }));

    if (categorySearch.trim()) {
      return items.filter((category: any) =>
        category.name
          .toLowerCase()
          .includes(categorySearch.toLowerCase())
      );
    }

    return items;
  }, [
    categoriesList,
    categoryAggMap,
    filters.partCategoryIds,
    categorySearch,
  ]);

  // ==========================================================
  // Brands
  // ==========================================================

  const formattedBrands: FilterItem[] = useMemo(() => {
    const selectedIds = new Set(
      (filters.brandIds || []).map(normalizeKey)
    );

    const items = brandsList
      .filter((brand: any) => {
        const id = normalizeKey(brand.id);

        return (
          brandAggMap.has(id) ||
          selectedIds.has(id)
        );
      })
      .map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        count:
          brandAggMap.get(normalizeKey(brand.id)) || 0,
      }));

    if (brandSearch.trim()) {
      return items.filter((brand: any) =>
        brand.name
          .toLowerCase()
          .includes(brandSearch.toLowerCase())
      );
    }

    return items;
  }, [
    brandsList,
    brandAggMap,
    filters.brandIds,
    brandSearch,
  ]);

  // ==========================================================
  // Parts
  // ==========================================================

  const allParts = partsData?.items || [];

  const formattedParts: FilterItem[] = useMemo(() => {
    const selectedIds = new Set(
      (filters.partIds || []).map(normalizeKey)
    );

    let items = allParts
      .filter((part: any) => {
        const id = normalizeKey(part.id);

        return (
          partAggMap.has(id) ||
          selectedIds.has(id)
        );
      })
      .map((part: any) => ({
        id: part.id,
        name: part.name,
        count:
          partAggMap.get(normalizeKey(part.id)) || 0,
      }));

    /**
     * در صورت نبودن اطلاعات نام قطعات در API،
     * شناسه‌های موجود در Aggregation حفظ می‌شوند.
     */
    if (items.length === 0 && partAggMap.size > 0) {
      items = Array.from(partAggMap.entries()).map(
        ([key, count]) => ({
          id: key,
          name: filters.searchTitle
            ? `قطعات مرتبط با «${filters.searchTitle}»`
            : 'قطعه مرتبط',
          count,
        })
      );
    }

    if (partSearch.trim()) {
      return items.filter((part: any) =>
        part.name
          .toLowerCase()
          .includes(partSearch.toLowerCase())
      );
    }

    return items;
  }, [
    allParts,
    partAggMap,
    filters.partIds,
    partSearch,
    filters.searchTitle,
  ]);

  // ==========================================================
  // Cars
  // ==========================================================

  const formattedCars: FilterItem[] = useMemo(() => {
    const selectedIds = new Set(
      (filters.carIds || []).map(normalizeKey)
    );

    const items = carsList
      .filter((car: any) => {
        const id = normalizeKey(car.id);

        return (
          carAggMap.has(id) ||
          selectedIds.has(id)
        );
      })
      .map((car: any) => ({
        id: car.id,
        name: car.displayName || car.model,
        count:
          carAggMap.get(normalizeKey(car.id)) || 0,
      }));

    if (carSearch.trim()) {
      return items.filter((car: any) =>
        car.name
          .toLowerCase()
          .includes(carSearch.toLowerCase())
      );
    }

    return items;
  }, [
    carsList,
    carAggMap,
    filters.carIds,
    carSearch,
  ]);

  // ==========================================================
  // Price
  // ==========================================================

  const dynamicMinPrice =
    aggregations?.priceStats?.min ?? 50000;

  const dynamicMaxPrice =
    aggregations?.priceStats?.max ?? 100000000;

  const [priceRange, setPriceRange] = useState<
    [number, number]
  >([
    filters.fromPrice || dynamicMinPrice,
    filters.toPrice || dynamicMaxPrice,
  ]);

  useEffect(() => {
    setPriceRange([
      filters.fromPrice || dynamicMinPrice,
      filters.toPrice || dynamicMaxPrice,
    ]);
  }, [
    filters.fromPrice,
    filters.toPrice,
    dynamicMinPrice,
    dynamicMaxPrice,
  ]);

  // ==========================================================
  // Filter handlers
  // ==========================================================

  const handleCheckboxChange = (
    name: string,
    id: string,
    checked: boolean
  ) => {
    const currentList =
      (filters[name as keyof SearchProductsRequest] as
        | string[]
        | undefined) || [];

    let updatedList = [...currentList];

    if (checked) {
      if (!updatedList.some((item) => normalizeKey(item) === normalizeKey(id))) {
        updatedList.push(id);
      }
    } else {
      updatedList = updatedList.filter(
        (item) => normalizeKey(item) !== normalizeKey(id)
      );
    }

    onFilterChange(
      name,
      updatedList.length > 0 ? updatedList : undefined
    );
  };

  const handleTypeChange = (
    type: 'New' | 'Stock' | 'TakeOff',
    checked: boolean
  ) => {
    const currentTypes =
      (filters.types as string[]) || [];

    let updatedTypes = [...currentTypes];

    if (checked) {
      if (!updatedTypes.includes(type)) {
        updatedTypes.push(type);
      }
    } else {
      updatedTypes = updatedTypes.filter(
        (item) => item !== type
      );
    }

    onFilterChange(
      'types',
      updatedTypes.length > 0 ? updatedTypes : undefined
    );
  };

  // ==========================================================
  // Active filters
  // ==========================================================

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
  const activeCategoriesCount =
    filters.partCategoryIds?.length || 0;
  const activePartsCount = filters.partIds?.length || 0;
  const activeBrandsCount = filters.brandIds?.length || 0;
  const activeCarsCount = filters.carIds?.length || 0;

  // فقط فیلتر انتخابی قیمت، فعال بودن فیلتر را مشخص می‌کند.
  const isPriceFilterActive = !!(
    filters.fromPrice || filters.toPrice
  );

  // ==========================================================
  // Type availability
  // ==========================================================

  const selectedTypes = (filters.types as string[]) || [];

  const isNewAvailable =
    (typeAggMap.get('new') || 0) > 0 ||
    selectedTypes.includes('New');

  const isStockAvailable =
    (typeAggMap.get('stock') || 0) > 0 ||
    selectedTypes.includes('Stock');

  const isTakeOffAvailable =
    (typeAggMap.get('takeoff') || 0) > 0 ||
    selectedTypes.includes('TakeOff');

  // ==========================================================
  // Helpers
  // ==========================================================

  const formatCount = (count: number) => {
    return count > 0
      ? ` (${toPersianDigits(count)})`
      : '';
  };

  // ==========================================================
  // Filter content
  // ==========================================================

  const renderFilterContent = (isMobile: boolean) => (
    <div
      className={cn(
        'flex w-full flex-col gap-4',
        isMobile && 'pb-24'
      )}
      dir="rtl"
    >
      {/* General filters */}

      <div className="flex flex-col gap-3.5 border-b border-border/80 pb-4">
        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            فقط کالاهای موجود
          </span>

          <Switch
            checked={!!filters.onlyInStock}
            onChange={(checked) =>
              onFilterChange(
                'inStock',
                checked ? true : undefined
              )
            }
          />
        </div>

        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            دارای تخفیف ویژه
          </span>

          <Switch
            checked={!!filters.onlyDiscounted}
            onChange={(checked) =>
              onFilterChange(
                'discount',
                checked ? true : undefined
              )
            }
          />
        </div>

        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            ارسال مستقیم از فروشنده
          </span>

          <Switch
            checked={!!filters.onlyDirectShipping}
            onChange={(checked) =>
              onFilterChange(
                'directShipping',
                checked ? true : undefined
              )
            }
          />
        </div>

        <div className="flex w-full select-none items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            فقط کالاهای برگزیده
          </span>

          <Switch
            checked={!!filters.onlyNominated}
            onChange={(checked) =>
              onFilterChange(
                'nominated',
                checked ? true : undefined
              )
            }
          />
        </div>
      </div>

      {/* Part types */}

      {(isNewAvailable ||
        isStockAvailable ||
        isTakeOffAvailable) && (
        <Accordion
          title={`نوع قطعه${formatCount(activeTypesCount)}`}
          defaultOpen={activeTypesCount > 0}
        >
          <div className="flex flex-col gap-2.5 pe-1 pt-1 text-xs">
            <Checkbox
              label="همه قطعات"
              checked={
                !filters.types ||
                filters.types.length === 0
              }
              onChange={(checked) =>
                checked &&
                onFilterChange('types', undefined)
              }
            />

            {isNewAvailable && (
              <Checkbox
                label={`نو ${
                  typeAggMap.get('new')
                    ? `(${toPersianDigits(
                        typeAggMap.get('new')!
                      )})`
                    : ''
                }`}
                checked={selectedTypes.includes('New')}
                onChange={(checked) =>
                  handleTypeChange('New', checked)
                }
              />
            )}

            {isStockAvailable && (
              <Checkbox
                label={`استوک ${
                  typeAggMap.get('stock')
                    ? `(${toPersianDigits(
                        typeAggMap.get('stock')!
                      )})`
                    : ''
                }`}
                checked={selectedTypes.includes('Stock')}
                onChange={(checked) =>
                  handleTypeChange('Stock', checked)
                }
              />
            )}

            {isTakeOffAvailable && (
              <Checkbox
                label={`زیرصفری ${
                  typeAggMap.get('takeoff')
                    ? `(${toPersianDigits(
                        typeAggMap.get('takeoff')!
                      )})`
                    : ''
                }`}
                checked={selectedTypes.includes('TakeOff')}
                onChange={(checked) =>
                  handleTypeChange('TakeOff', checked)
                }
              />
            )}
          </div>
        </Accordion>
      )}

      {/* Categories */}

      {formattedCategories.length > 0 && (
        <Accordion
          title={`دسته‌بندی قطعه${formatCount(
            activeCategoriesCount
          )}`}
          defaultOpen={activeCategoriesCount > 0}
        >
          <FilterList
            items={formattedCategories}
            selectedIds={
              (filters.partCategoryIds as string[]) || []
            }
            onChange={(id, checked) =>
              handleCheckboxChange(
                'partCategoryIds',
                String(id),
                checked
              )
            }
            searchPlaceholder="جستجوی دسته‌بندی..."
            onSearchChange={setCategorySearch}
          />
        </Accordion>
      )}

      {/* Parts */}

      {!hidePartFilter && formattedParts.length > 0 && (
        <Accordion
          title={`قطعه${formatCount(activePartsCount)}`}
          defaultOpen={activePartsCount > 0}
        >
          <FilterList
            items={formattedParts}
            selectedIds={
              (filters.partIds as string[]) || []
            }
            onChange={(id, checked) =>
              handleCheckboxChange(
                'partIds',
                String(id),
                checked
              )
            }
            searchPlaceholder="جستجوی نام قطعه..."
            onSearchChange={setPartSearch}
          />
        </Accordion>
      )}

      {/* Brands */}

      {formattedBrands.length > 0 && (
        <Accordion
          title={`برند قطعه${formatCount(activeBrandsCount)}`}
          defaultOpen={activeBrandsCount > 0}
        >
          <FilterList
            items={formattedBrands}
            selectedIds={
              (filters.brandIds as string[]) || []
            }
            onChange={(id, checked) =>
              handleCheckboxChange(
                'brandIds',
                String(id),
                checked
              )
            }
            searchPlaceholder="جستجوی برند..."
            onSearchChange={setBrandSearch}
          />
        </Accordion>
      )}

      {/* Cars */}

      {formattedCars.length > 0 && (
        <Accordion
          title={`مدل خودرو${formatCount(activeCarsCount)}`}
          defaultOpen={activeCarsCount > 0}
        >
          <FilterList
            items={formattedCars}
            selectedIds={
              (filters.carIds as string[]) || []
            }
            onChange={(id, checked) =>
              handleCheckboxChange(
                'carIds',
                String(id),
                checked
              )
            }
            searchPlaceholder="جستجوی مدل خودرو..."
            onSearchChange={setCarSearch}
          />
        </Accordion>
      )}

      {/* Price */}

      <Accordion
        title={
          isPriceFilterActive
            ? 'محدوده قیمت (فعال)'
            : 'محدوده قیمت'
        }
        defaultOpen={isPriceFilterActive}
      >
        <PriceSlider
          min={dynamicMinPrice}
          max={dynamicMaxPrice}
          value={priceRange}
          onChange={(value) => setPriceRange(value)}
          onApply={() => {
            onFilterChange('fromPrice', priceRange[0]);
            onFilterChange('toPrice', priceRange[1]);
          }}
        />
      </Accordion>
    </div>
  );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <>
      {/* Desktop Sidebar */}

      <aside
        style={{
          top: 'calc(var(--header-height, 108px) + 0.75rem)',
          maxHeight:
            'calc(100vh - var(--header-height, 108px) - 1.5rem)',
        }}
        className="hidden w-[18rem] shrink-0 sticky flex-col gap-4 overflow-y-auto scrollbar-thin select-none lg:flex"
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

              <Typography
                variant="h5"
                className="font-bold text-foreground"
              >
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

      {/* Mobile Sidebar */}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-modal flex h-full max-h-full w-full max-w-none flex-col rounded-none bg-card p-0"
        overlayClassName="bg-black/40 backdrop-blur-sm"
      >
        {/* Header */}

        <div
          className="flex shrink-0 items-center justify-between border-b border-border bg-muted/20 px-4 py-3.5"
          dir="rtl"
        >
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

        {/* Content */}

        <div
          className="relative flex-1 overflow-y-auto p-4 scrollbar-thin"
          dir="rtl"
        >
          {renderFilterContent(true)}
        </div>

        {/* Footer */}

        <div
          className="sticky bottom-0 right-0 left-0 z-sticky flex shrink-0 gap-3 border-t border-border bg-card p-4 shadow-lg"
          dir="rtl"
        >
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
