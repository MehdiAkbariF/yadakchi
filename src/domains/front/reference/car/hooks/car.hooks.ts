// src/domains/front/reference/car/hooks/car.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getCarService } from '../services/car.service';
import { CarFilters, CarNameFilters, CarManufacturerFilters, CarViewModel, CarNameViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const carService = getCarService();

// ارتقای هوک برای پذیرش پارامترهای اختیاری نظیر فعال‌سازی شرطی کوئری (enabled)
export function useGetCarListFlat(pageNumber: number = 1, pageSize: number = 200, options?: any) {
  return useTypedQuery<any[]>(
    ['reference', 'cars', 'flat-list', pageNumber, pageSize],
    () => carService.getCarListFlat(pageNumber, pageSize),
    {
      staleTime: 10 * 60 * 1000,
      ...options
    }
  );
}

export function useGetCarList(
  filters: CarFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<CarViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['reference', 'cars', 'list', filters],
    () => carService.getCarList(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 10 * 60 * 1000,
      ...options,
    }
  );
}

export function useGetCarsName(filters: CarNameFilters = {}) {
  return useTypedQuery(
    ['reference', 'cars', 'names', filters],
    () => carService.getCarsName(filters),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useGetCarPage(carModel: string) {
  return useTypedQuery(
    ['reference', 'cars', 'page', carModel],
    () => carService.getCarPage(carModel),
    {
      staleTime: 10 * 60 * 1000,
      enabled: !!carModel,
    }
  );
}

export function useGetCarManufacturers(filters: CarManufacturerFilters = {}) {
  return useTypedQuery(
    ['reference', 'cars', 'manufacturers', filters],
    () => carService.getCarManufacturers(filters),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}