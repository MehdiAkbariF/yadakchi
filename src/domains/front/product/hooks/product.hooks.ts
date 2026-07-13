'use client';

import { useInfiniteQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getProductService } from '../services/product.service';
import { SearchProductsRequest, ProductViewModel, ProductPriceChartViewModel } from '@/domains/front/product/types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';
import { useAppStore } from '@/shared/store/useAppStore';

const productService = getProductService();

export function useGetNominatedProducts() {
  const cityId = useAppStore((state) => state.selectedCity?.id);

  return useTypedQuery<any>(
    ['front', 'products', 'nominated-deals', cityId || null],
    () => productService.getNominatedProducts(cityId || undefined),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useGetNominatedProductsByCategory(categoryEnglishTitle: string) {
  const cityId = useAppStore((state) => state.selectedCity?.id);

  return useTypedQuery<any>(
    ['front', 'products', 'nominated-category', categoryEnglishTitle, cityId || null],
    () => productService.getNominatedProductsByCategory(categoryEnglishTitle, cityId || undefined),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!categoryEnglishTitle,
    }
  );
}

export function useSearchProducts(
  params: SearchProductsRequest,
  options?: Omit<UseQueryOptions<PaginatedResult<ProductViewModel>>, 'queryKey' | 'queryFn'>
) {
  const cityId = useAppStore((state) => state.selectedCity?.id);
  const updatedParams = { ...params, cityId: params.cityId || cityId || undefined };

  return useTypedQuery(
    queryKeys.front.products.search(updatedParams),
    () => productService.searchProducts(updatedParams),
    {
      placeholderData: (previousData) => previousData,
      staleTime: 60 * 1000,
      ...options,
    }
  );
}

export function useInfiniteSearchProducts(
  params: Omit<SearchProductsRequest, 'pageNumber' | 'pageSize'>
) {
  const cityId = useAppStore((state) => state.selectedCity?.id);
  const updatedParams = { ...params, cityId: params.cityId || cityId || undefined };

  return useInfiniteQuery({
    queryKey: queryKeys.front.products.search({ ...updatedParams, pageNumber: 1, pageSize: 30 }),
    queryFn: ({ pageParam = 1 }) =>
      productService.searchProducts({
        ...updatedParams,
        pageNumber: pageParam,
        pageSize: 30,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export function useGetProductDetails(
  productCode: number,
  options?: Omit<UseQueryOptions<ProductViewModel>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    queryKeys.front.products.details(productCode),
    () => productService.getProductDetails(productCode),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!productCode && productCode > 0,
      ...options,
    }
  );
}

export function useGetRelatedProducts(
  productCode: number,
  options?: Omit<UseQueryOptions<ProductViewModel[]>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'products', 'related', productCode],
    () => productService.getRelatedProducts(productCode),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!productCode && productCode > 0,
      ...options,
    }
  );
}

export function useGetProductPriceChart(
  productId: string,
  shopProductType: 'New' | 'Stock' | 'TakeOff',
  options?: Omit<UseQueryOptions<ProductPriceChartViewModel>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    ['front', 'products', 'price-chart', productId, shopProductType],
    () => productService.getProductPriceChart(productId, shopProductType),
    {
      staleTime: 10 * 60 * 1000,
      enabled: !!productId,
      ...options,
    }
  );
}

export function useGetSearchSuggestions(searchTitle?: string) {
  return useTypedQuery<string[]>(
    ['front', 'products', 'suggestions', searchTitle || 'default'],
    () => productService.getSearchSuggestions(searchTitle),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useGetSearchKeywords(searchTitle: string) {
  return useTypedQuery<{ keywords: any[]; cars: any[]; }>(
    ['front', 'products', 'keywords', searchTitle],
    () => productService.getSearchKeywords(searchTitle),
    {
      staleTime: 20 * 1000,
      enabled: searchTitle.trim().length >= 2,
    }
  );
}

export function useGetSearchHistory() {
  return useTypedQuery<any[]>(
    ['front', 'products', 'search-history'],
    () => productService.getSearchHistory(),
    {
      staleTime: 10 * 1000,
    }
  );
}

export function useRemoveSearchHistory() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (searchTitle?: string) => productService.removeSearchHistory(searchTitle),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['front', 'products', 'search-history'],
        });
      },
    }
  );
}