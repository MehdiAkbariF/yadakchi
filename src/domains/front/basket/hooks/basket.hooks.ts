// src/domains/front/basket/hooks/basket.hooks.ts

import { useQueryClient } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { queryKeys } from '@/lib/react-query/query-keys';
import { getBasketService } from '../services/basket.service';
import { AddToBasketRequest, DeleteFromBasketRequest } from '../types/view.types';
import { BasketViewModel } from '../types/view.types';

const basketService = getBasketService();

export function useGetBasket() {
  return useTypedQuery(
    queryKeys.front.basket.current,
    () => basketService.getBasket(),
    {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    }
  );
}

export function useAddToBasket() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    (request: AddToBasketRequest) => basketService.addToBasket(request),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(queryKeys.front.basket.current, data);
        queryClient.invalidateQueries({
          queryKey: queryKeys.front.basket.current,
        });
      },
    }
  );
}

export function useDeleteFromBasket() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    (request: DeleteFromBasketRequest) => basketService.deleteFromBasket(request),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(queryKeys.front.basket.current, data);
        queryClient.invalidateQueries({
          queryKey: queryKeys.front.basket.current,
        });
      },
    }
  );
}

export function useUpdateBasketQuantity() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    ({ shopProductId, quantity }: { shopProductId: string; quantity: number }) =>
      basketService.updateQuantity(shopProductId, quantity),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(queryKeys.front.basket.current, data);
        queryClient.invalidateQueries({
          queryKey: queryKeys.front.basket.current,
        });
      },
    }
  );
}

export function useClearBasket() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    () => basketService.clearBasket(),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(queryKeys.front.basket.current, data);
        queryClient.invalidateQueries({
          queryKey: queryKeys.front.basket.current,
        });
      },
    }
  );
}

// Optimistic update hook
export function useOptimisticAddToBasket() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    (request: AddToBasketRequest) => basketService.addToBasket(request),
    {
      onMutate: async (request) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKeys.front.basket.current,
        });

        // Snapshot previous value
        const previousBasket = queryClient.getQueryData<BasketViewModel>(
          queryKeys.front.basket.current
        );

        // Optimistically update
        if (previousBasket) {
          const existingItem = previousBasket.items.find(
            (item) => item.shopProductId === request.shopProductId
          );

          let updatedItems = [...previousBasket.items];
          
          if (existingItem) {
            updatedItems = updatedItems.map((item) =>
              item.shopProductId === request.shopProductId
                ? { ...item, quantity: item.quantity + request.quantity }
                : item
            );
          }

          queryClient.setQueryData(queryKeys.front.basket.current, {
            ...previousBasket,
            items: updatedItems,
          });
        }

        return { previousBasket };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        const previousBasket = (context as { previousBasket?: BasketViewModel })?.previousBasket;
        if (previousBasket) {
          queryClient.setQueryData(
            queryKeys.front.basket.current,
            previousBasket
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.front.basket.current,
        });
      },
    }
  );
}