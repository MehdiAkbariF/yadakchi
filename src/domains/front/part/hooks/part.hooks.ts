import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getPartService } from '../services/part.service';
import { PartFilters, PartCategoryFilters, PartViewModel, PartCategoryViewModel, PartCategoryPageViewModel, PartNameViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';
import { getHttpClient } from '@/core/http/client';

const carService = getPartService();

export function useGetPartCategoriesFlat(carId?: string) {
  return useTypedQuery<any[]>(
    ['front', 'parts', 'categories-flat', carId || 'all'],
    async () => {
      const client = getHttpClient();
      const response = await client.get<any[]>('/api/Front/PartCategories', {
        params: { CarId: carId || '' }
      });
      return Array.isArray(response.data) ? response.data : [];
    },
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useGetPartCategoriesNameFlat() {
  return useTypedQuery<any[]>(
    ['front', 'parts', 'categories-name-flat'],
    async () => {
      const client = getHttpClient();
      const response = await client.get<any[]>('/api/Front/PartCategoriesName', {
        params: { PageNumber: 1, PageSize: 30 }
      });
      return Array.isArray(response.data) ? response.data : [];
    },
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}

export function useGetPartList(
  filters: PartFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<PartViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'parts', 'list', filters],
    () => carService.getPartList(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 60 * 1000,
      ...options,
    }
  );
}

export function useGetPartPage(partEnglishName: string, carModel?: string) {
  return useTypedQuery(
    ['front', 'parts', 'page', partEnglishName, carModel],
    () => carService.getPartPage(partEnglishName, carModel),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!partEnglishName,
    }
  );
}

export function useGetPartProperties(partId: string) {
  return useTypedQuery(
    ['front', 'parts', 'properties', partId],
    () => carService.getPartProperties(partId),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!partId,
    }
  );
}

export function useGetPartsName(filters: PartFilters) {
  return useTypedQuery<PaginatedResult<PartNameViewModel>>(
    ['front', 'parts', 'names', filters],
    () => carService.getPartsName(filters),
    {
      staleTime: 60 * 1000,
    }
  );
}

export function useGetPartCategories(carId?: string) {
  return useTypedQuery(
    ['front', 'parts', 'categories', carId],
    () => carService.getPartCategories(carId),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useGetPartCategoryPage(englishTitle: string) {
  return useTypedQuery(
    ['front', 'parts', 'category-page', englishTitle],
    () => carService.getPartCategoryPage(englishTitle),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!englishTitle,
    }
  );
}

export function useGetPartCategoriesName(filters: PartCategoryFilters) {
  return useTypedQuery(
    ['front', 'parts', 'categories-name', filters],
    () => carService.getPartCategoriesName(filters),
    {
      staleTime: 60 * 1000,
    }
  );
}