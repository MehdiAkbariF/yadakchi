// src/domains/front/product/hooks/product.hooks.ts

import { useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getProductService } from '../services/product.service';
import { SearchProductsRequest } from '../types/view.types';
import { ProductViewModel, ProductPriceChartViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

const productService = getProductService();

export function useSearchProducts(
  params: SearchProductsRequest,
  options?: Omit<UseQueryOptions<PaginatedResult<ProductViewModel>>, 'queryKey' | 'queryFn'>
) {
  return useTypedQuery(
    queryKeys.front.products.search(params),
    () => productService.searchProducts(params),
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
  return useInfiniteQuery({
    queryKey: queryKeys.front.products.search({ ...params, pageNumber: 1, pageSize: 30 }),
    queryFn: ({ pageParam = 1 }) =>
      productService.searchProducts({
        ...params,
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

export function useSearchSuggestions(searchTitle: string) {
  return useTypedQuery(
    ['front', 'products', 'suggestions', searchTitle],
    () => productService.getSearchSuggestions(searchTitle),
    {
      staleTime: 60 * 1000,
      enabled: searchTitle.length >= 2,
    }
  );
}

export function useSearchKeywords(searchTitle: string) {
  return useTypedQuery(
    ['front', 'products', 'keywords', searchTitle],
    () => productService.getSearchKeywords(searchTitle),
    {
      staleTime: 60 * 1000,
      enabled: searchTitle.length >= 2,
    }
  );
}