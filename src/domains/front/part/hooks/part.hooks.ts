// src/domains/front/part/hooks/part.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getPartService } from '../services/part.service';
import { PartFilters, PartCategoryFilters } from '../types/view.types';
import { PartViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const partService = getPartService();

export function useGetPartList(
  filters: PartFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<PartViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'parts', 'list', filters],
    () => partService.getPartList(filters),
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
    () => partService.getPartPage(partEnglishName, carModel),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!partEnglishName,
    }
  );
}

export function useGetPartProperties(partId: string) {
  return useTypedQuery(
    ['front', 'parts', 'properties', partId],
    () => partService.getPartProperties(partId),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!partId,
    }
  );
}

export function useGetPartsName(filters: PartFilters) {
  return useTypedQuery(
    ['front', 'parts', 'names', filters],
    () => partService.getPartsName(filters),
    {
      staleTime: 60 * 1000,
    }
  );
}

export function useGetPartCategories(carId?: string) {
  return useTypedQuery(
    ['front', 'parts', 'categories', carId],
    () => partService.getPartCategories(carId),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useGetPartCategoryPage(englishTitle: string) {
  return useTypedQuery(
    ['front', 'parts', 'category-page', englishTitle],
    () => partService.getPartCategoryPage(englishTitle),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!englishTitle,
    }
  );
}

export function useGetPartCategoriesName(filters: PartCategoryFilters) {
  return useTypedQuery(
    ['front', 'parts', 'categories-name', filters],
    () => partService.getPartCategoriesName(filters),
    {
      staleTime: 60 * 1000,
    }
  );
}