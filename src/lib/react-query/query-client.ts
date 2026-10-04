// src/lib/react-query/query-client.ts

import { QueryClient, QueryClientConfig, isServer } from '@tanstack/react-query';
import { ApiError } from '@/core/errors/api-error';
import { errorManager } from '@/core/errors/error-manager';
import { constants } from '@/core/config/constants';
import { env } from '@/core/config/env';

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: (constants?.cacheTime?.MEDIUM || 60) * 1000,
      gcTime: (constants?.cacheTime?.LONG || 300) * 1000,
      
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.isClientError()) {
          return false;
        }
        return failureCount < (constants?.retry?.MAX_ATTEMPTS || 2);
      },
      
      retryDelay: (attemptIndex) => {
        return Math.min(
          (constants?.retry?.BASE_DELAY || 1000) * Math.pow(2, attemptIndex),
          constants?.retry?.MAX_DELAY || 30000
        );
      },
      
      // ✅ اصلاح مهم: هرگز نباید true باشد تا دیتای سرور در رفرش نپرد
      refetchOnMount: false, 
      refetchOnWindowFocus: false, // جلوگیری از پرش ناگهانی هنگام کلیک مجدد روی تب
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

// ✅ استاندارد رسمی TanStack Query برای Next.js App Router:
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    // سمت سرور: همیشه کلاینت نو بسازد
    return createQueryClient();
  } else {
    // سمت مرورگر: فقط ۱ بار کلاینت می‌سازد و در رفرش دیتایش حفظ می‌شود
    if (!browserQueryClient) browserQueryClient = createQueryClient();
    return browserQueryClient;
  }
}

export function resetQueryClient(): void {
  const client = getQueryClient();
  client.clear();
}

export function handleQueryError(error: unknown): void {
  const apiError = errorManager.normalize(error);
  errorManager.handleError(apiError);
}