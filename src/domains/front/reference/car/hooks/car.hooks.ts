// src/domains/front/reference/car/hooks/car.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getCarService } from '../services/car.service';
import { CarFilters, CarNameFilters, CarManufacturerFilters } from '../types/view.types';
import { CarViewModel, CarNameViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const carService = getCarService();

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

export function useGetCarsName(
  filters: CarNameFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<CarNameViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['reference', 'cars', 'names', filters],
    () => carService.getCarsName(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 10 * 60 * 1000,
      ...options,
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