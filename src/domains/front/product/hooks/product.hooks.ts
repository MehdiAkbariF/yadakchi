// src/domains/front/product/hooks/product.hooks.ts

'use client';

import { useState, useEffect } from 'react';
import { useInfiniteQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { getProductService } from '../services/product.service';
import { SearchProductsRequest, ProductViewModel, ProductPriceChartViewModel, ProductPageViewModel, CommentsAverageViewModel, CommentItemViewModel, InquiryItemViewModel } from '@/domains/front/product/types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';
import { useAppStore } from '@/shared/store/useAppStore';

const productService = getProductService();

export function useGetNominatedProducts() {
  const selectedCity = useAppStore((state) => state.selectedCity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cityId = mounted ? selectedCity?.id : null;

  return useTypedQuery<any>(
    ['front', 'products', 'nominated-deals', cityId || null],
    () => productService.getNominatedProducts(cityId || undefined),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

/*
  اصلاح هوک جهت پشتیبانی از آرگومان دوم تنظیمات کوئری (مانند فعال‌ساز لود تنبل - enabled):
  با این تغییر، هوک قادر است به شکل استاندارد پارامترهای پیش‌فرض یا انتخابی React Query را 
  پذیرفته و آن‌ها را در تابع useTypedQuery ادغام (Merge) کند.
*/
export function useGetNominatedProductsByCategory(
  categoryEnglishTitle: string,
  options?: Omit<UseQueryOptions<any, any>, 'queryKey' | 'queryFn'>
) {
  const selectedCity = useAppStore((state) => state.selectedCity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cityId = mounted ? selectedCity?.id : null;

  return useTypedQuery<any>(
    ['front', 'products', 'nominated-category', categoryEnglishTitle, cityId || null],
    () => productService.getNominatedProductsByCategory(categoryEnglishTitle, cityId || undefined),
    {
      staleTime: 5 * 60 * 1000,
      ...options,
      enabled: !!categoryEnglishTitle && (options?.enabled !== false),
    }
  );
}

export function useSearchProducts(
  params: SearchProductsRequest,
  options?: Omit<UseQueryOptions<PaginatedResult<ProductViewModel>>, 'queryKey' | 'queryFn'>
) {
  const selectedCity = useAppStore((state) => state.selectedCity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cityId = mounted ? selectedCity?.id : null;
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
  const selectedCity = useAppStore((state) => state.selectedCity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cityId = mounted ? selectedCity?.id : null;
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
  options?: Omit<UseQueryOptions<ProductViewModel, any>, 'queryKey' | 'queryFn'>
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
  options?: Omit<UseQueryOptions<ProductViewModel[], any>, 'queryKey' | 'queryFn'>
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
  options?: Omit<UseQueryOptions<ProductPriceChartViewModel, any>, 'queryKey' | 'queryFn'>
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

export function useGetProductPageData(productCode: number) {
  return useTypedQuery(
    ['front', 'products', 'page-data', productCode],
    () => productService.getProductPageData(productCode),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!productCode && productCode > 0
    }
  );
}

export function useGetProductCommentsAverage(productId: string) {
  return useTypedQuery(
    ['front', 'products', 'comments-average', productId],
    () => productService.getProductCommentsAverage(productId),
    {
      staleTime: 5 * 60 * 1000,
      enabled: !!productId
    }
  );
}

export function useGetProductComments(productId: string, orderBy: string = 'Newest', pageNumber: number = 1) {
  return useTypedQuery(
    ['front', 'products', 'comments-list', productId, orderBy, pageNumber],
    () => productService.getProductComments(productId, orderBy, pageNumber, 30),
    {
      staleTime: 60 * 1000,
      enabled: !!productId
    }
  );
}

export function useGetProductInquiries(productId: string, orderBy: string = 'Latest', pageNumber: number = 1) {
  return useTypedQuery(
    ['front', 'products', 'inquiries-list', productId, orderBy, pageNumber],
    () => productService.getProductInquiries(productId, orderBy, pageNumber, 30),
    {
      staleTime: 60 * 1000,
      enabled: !!productId
    }
  );
}

export function useIsUserFavoriteProduct(productCode: number) {
  return useTypedQuery(
    ['front', 'products', 'is-favorite', productCode],
    () => productService.isUserFavoriteProduct(productCode),
    {
      staleTime: 10 * 1000,
      enabled: !!productCode && productCode > 0
    }
  );
}

export function useAddFavorite(productCode: number) {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (productId: string) => productService.addFavorite(productId),
    {
      onSuccess: () => {
        queryClient.setQueryData(['front', 'products', 'is-favorite', productCode], true);
        queryClient.invalidateQueries({ queryKey: ['front', 'products', 'is-favorite', productCode] });
      }
    }
  );
}

export function useDeleteFavorite(productCode: number) {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (productId: string) => productService.deleteFavorite(productId),
    {
      onSuccess: () => {
        queryClient.setQueryData(['front', 'products', 'is-favorite', productCode], false);
        queryClient.invalidateQueries({ queryKey: ['front', 'products', 'is-favorite', productCode] });
      }
    }
  );
}

export function useSubmitProductReport() {
  return useTypedMutation(
    ({ productId, reportSubjectId, description }: { productId: string; reportSubjectId: string; description: string }) =>
      productService.submitProductReport(productId, reportSubjectId, description)
  );
}