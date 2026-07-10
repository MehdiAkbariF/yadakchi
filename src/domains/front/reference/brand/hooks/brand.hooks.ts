// src/domains/front/reference/brand/hooks/brand.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getBrandService } from '../services/brand.service';
import { BrandFilters, BrandNameFilters } from '../types/view.types';
import { BrandViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const brandService = getBrandService();

export function useGetBrands(
  filters: BrandFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<BrandViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['reference', 'brands', 'list', filters],
    () => brandService.getBrands(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 10 * 60 * 1000,
      ...options,
    }
  );
}

export function useGetBrandsName(filters: BrandNameFilters = {}) {
  return useTypedQuery(
    ['reference', 'brands', 'names', filters],
    () => brandService.getBrandsName(filters),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useGetMainBrands() {
  return useTypedQuery(
    ['reference', 'brands', 'main'],
    () => brandService.getMainBrands(),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}