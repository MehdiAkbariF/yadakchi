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
      
      // جایگزین keepPreviousData با placeholderData
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