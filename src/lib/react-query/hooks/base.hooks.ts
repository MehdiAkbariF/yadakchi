// src/lib/react-query/hooks/base.hooks.ts

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query';
import { ApiError } from '@/core/errors/api-error';
import { handleQueryError } from '../query-client';

export function useTypedQuery<TData, TError = ApiError>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        handleQueryError(error);
        throw error;
      }
    },
    ...options,
  });
}

export function useTypedMutation<TData, TVariables, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        handleQueryError(error);
        throw error;
      }
    },
    ...options,
  });
}