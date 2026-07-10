// src/lib/react-query/query-client.ts

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { ApiError } from '@/core/errors/api-error';
import { errorManager } from '@/core/errors/error-manager';
import { constants } from '@/core/config/constants';
import { env } from '@/core/config/env';

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: constants.cacheTime.MEDIUM * 1000,
      gcTime: constants.cacheTime.LONG * 1000,
      
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.isClientError()) {
          return false;
        }
        return failureCount < constants.retry.MAX_ATTEMPTS;
      },
      
      retryDelay: (attemptIndex) => {
        return Math.min(
          constants.retry.BASE_DELAY * Math.pow(2, attemptIndex),
          constants.retry.MAX_DELAY
        );
      },
      
      refetchOnMount: true,
      refetchOnWindowFocus: env.isProduction,
      refetchOnReconnect: true,
      
      placeholderData: (previousData: unknown) => previousData,
      
      throwOnError: (_error: unknown) => {
        return false;
      },
    },
    
    mutations: {
      retry: false,
      throwOnError: (_error: unknown) => {
        return false;
      },
    },
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}

export const queryClient = createQueryClient();

export function resetQueryClient(): void {
  queryClient.clear();
}

export function handleQueryError(error: unknown): void {
  const apiError = errorManager.normalize(error);
  errorManager.handleError(apiError);
}

// Query Keys
export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  front: {
    products: {
      all: ['front', 'products'] as const,
      details: (productCode: number) => ['front', 'products', 'details', productCode] as const,
      search: (params: any) => ['front', 'products', 'search', params] as const,
    },
    basket: {
      current: ['front', 'basket', 'current'] as const,
    },
    shops: {
      details: (shopId: string) => ['front', 'shops', 'details', shopId] as const,
      cards: (params: any) => ['front', 'shops', 'cards', params] as const,
      best: ['front', 'shops', 'best'] as const,
    },
    comments: {
      product: (productId: string, params: any) => 
        ['front', 'comments', 'product', productId, params] as const,
      replies: (commentId: string, params: any) => 
        ['front', 'comments', 'replies', commentId, params] as const,
    },
    inquiries: {
      product: (productId: string, params: any) => 
        ['front', 'inquiries', 'product', productId, params] as const,
      replies: (inquiryId: string, params: any) => 
        ['front', 'inquiries', 'replies', inquiryId, params] as const,
    },
    parts: {
      list: (params: any) => ['front', 'parts', 'list', params] as const,
      page: (englishName: string, carModel?: string) => 
        ['front', 'parts', 'page', englishName, carModel] as const,
      categories: (carId?: string) => ['front', 'parts', 'categories', carId] as const,
    },
    banners: {
      list: (pageName: string) => ['front', 'banners', pageName] as const,
      shopProduct: (params: any) => ['front', 'banners', 'shop-product', params] as const,
    },
    megaMenu: ['front', 'mega-menu'] as const,
    footer: ['front', 'footer'] as const,
    static: {
      page: (title: string) => ['front', 'static', 'page', title] as const,
      faq: (params: any) => ['front', 'static', 'faq', params] as const,
    },
    reference: {
      cars: {
        list: (params: any) => ['front', 'reference', 'cars', 'list', params] as const,
        names: (params: any) => ['front', 'reference', 'cars', 'names', params] as const,
        manufacturers: (params: any) => ['front', 'reference', 'cars', 'manufacturers', params] as const,
      },
      brands: {
        list: (params: any) => ['front', 'reference', 'brands', 'list', params] as const,
        main: ['front', 'reference', 'brands', 'main'] as const,
      },
      cities: {
        list: (params: any) => ['front', 'reference', 'cities', 'list', params] as const,
        province: (provinceId: string) => ['front', 'reference', 'cities', 'province', provinceId] as const,
      },
      provinces: {
        list: (params: any) => ['front', 'reference', 'provinces', 'list', params] as const,
      },
    },
  },
  user: {
    profile: ['user', 'profile'] as const,
    orders: {
      list: (params: any) => ['user', 'orders', 'list', params] as const,
      details: (orderId: string) => ['user', 'orders', 'details', orderId] as const,
    },
    favorites: {
      list: (params: any) => ['user', 'favorites', 'list', params] as const,
    },
    notifications: {
      list: (params: any) => ['user', 'notifications', 'list', params] as const,
    },
    wallet: {
      balance: ['user', 'wallet', 'balance'] as const,
      transactions: (params: any) => ['user', 'wallet', 'transactions', params] as const,
    },
  },
} as const;