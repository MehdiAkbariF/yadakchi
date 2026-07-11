// src/domains/front/reference/city/hooks/city.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getCityService } from '../services/city.service';
import { CityFilters, ProvinceCitiesTreeViewModel } from '../types/view.types';
import { CityViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const cityService = getCityService();

export function useGetCities(
  filters: CityFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<CityViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['reference', 'cities', 'list', filters],
    () => cityService.getCities(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 15 * 60 * 1000,
      ...options,
    }
  );
}

export function useGetProvinceCities(provinceId: string, cityName?: string) {
  return useTypedQuery(
    ['reference', 'cities', 'province', provinceId, cityName],
    () => cityService.getProvinceCities(provinceId, cityName),
    {
      staleTime: 10 * 60 * 1000,
      enabled: !!provinceId,
    }
  );
}

// هوک کش‌گذاری‌شده جهت بارگذاری کل ساختار استانی و شهری
export function useGetProvinceCitiesTree() {
  return useTypedQuery<ProvinceCitiesTreeViewModel[]>(
    ['reference', 'cities', 'tree'],
    () => cityService.getProvinceCitiesTree(),
    {
      staleTime: 30 * 60 * 1000, // ۳۰ دقیقه ماندگاری کش برای بهینه‌سازی بارگذاری
    }
  );
}