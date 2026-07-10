// src/domains/front/shop/hooks/shop.hooks.ts

import { UseQueryOptions } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getShopService } from '../services/shop.service';
import { ShopFilters, ShopReportRequest, ShopCardViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const shopService = getShopService();

export function useGetShop(shopId: string) {
  return useTypedQuery(
    ['front', 'shop', 'details', shopId],
    () => shopService.getShop(shopId),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!shopId,
    }
  );
}

export function useGetShopPage(shopId: string) {
  return useTypedQuery(
    ['front', 'shop', 'page', shopId],
    () => shopService.getShopPage(shopId),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!shopId,
    }
  );
}

export function useGetBestShops() {
  return useTypedQuery(
    ['front', 'shop', 'best'],
    () => shopService.getBestShops(),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useGetShopCards(
  filters: ShopFilters,
  options?: Omit<UseQueryOptions<PaginatedResult<ShopCardViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'shop', 'cards', filters],
    () => shopService.getShopCards(filters),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 60 * 1000,
      ...options,
    }
  );
}

export function useGetShopPerformance() {
  return useTypedQuery(
    ['front', 'shop', 'performance'],
    () => shopService.getShopPerformance(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useGetReportSubjects() {
  return useTypedQuery(
    ['front', 'shop', 'report-subjects'],
    () => shopService.getReportSubjects(),
    {
      staleTime: 10 * 60 * 1000,
    }
  );
}

export function useSubmitShopReport() {
  return useTypedMutation(
    (report: ShopReportRequest) => shopService.submitShopReport(report)
  );
}