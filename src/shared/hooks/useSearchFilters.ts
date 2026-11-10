// src/shared/hooks/useSearchFilters.ts
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';

export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const getFilters = useCallback((): SearchProductsRequest => {
    return {
      searchTitle: searchParams.get('q') || undefined,
      onlyInStock: searchParams.get('inStock') === 'true' ? true : undefined,
      onlyDiscounted: searchParams.get('discount') === 'true' ? true : undefined,
      onlyDirectShipping: searchParams.get('directShipping') === 'true' ? true : undefined, // فیلتر جدید
      onlyNominated: searchParams.get('nominated') === 'true' ? true : undefined,           // فیلتر جدید
      hasDiscountWithExpiration: searchParams.get('discountExp') === 'true' ? true : undefined,
      fromPrice: searchParams.get('fromPrice') ? Number(searchParams.get('fromPrice')) : undefined,
      toPrice: searchParams.get('toPrice') ? Number(searchParams.get('toPrice')) : undefined,
      orderType: (searchParams.get('sort') as any) || 'Selected',
      pageNumber: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 30,
      brandIds: searchParams.getAll('brandIds').length ? searchParams.getAll('brandIds') : undefined,
      carIds: searchParams.getAll('carIds').length ? searchParams.getAll('carIds') : undefined,
      partCategoryIds: searchParams.getAll('partCategoryIds').length ? searchParams.getAll('partCategoryIds') : undefined,
      partIds: searchParams.getAll('partIds').length ? searchParams.getAll('partIds') : undefined,
      types: searchParams.getAll('types').length ? (searchParams.getAll('types') as any) : undefined,
      includeAggregations: true,
    };
  }, [searchParams]);

const setFilter = useCallback((name: string, value: any) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === undefined || value === null || value === '' || value === false) {
      params.delete(name);
    } else if (Array.isArray(value)) {
      // پاک کردن مقادیر قبلی و ثبت تک‌تک آیتم‌های آرایه در URL
      params.delete(name);
      value.forEach(item => params.append(name, String(item)));
    } else {
      params.set(name, String(value));
    }

    if (name !== 'page') {
      params.delete('page');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [router, pathname, searchParams]);

  const removeFilter = useCallback((name: string, valueToRemove?: any) => {
    const params = new URLSearchParams(searchParams.toString());

    if (valueToRemove !== undefined && Array.isArray(searchParams.getAll(name))) {
      const allValues = searchParams.getAll(name).filter((v) => v !== String(valueToRemove));
      params.delete(name);
      allValues.forEach((v) => params.append(name, v));
    } else {
      params.delete(name);
    }

    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [router, pathname, searchParams]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) {
      params.set('q', query);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [router, pathname, searchParams]);

  return {
    filters: getFilters(),
    setFilter,
    removeFilter,
    clearFilters,
    isPending,
  };
}