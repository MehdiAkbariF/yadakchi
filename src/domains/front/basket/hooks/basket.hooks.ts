// src/domains/front/basket/hooks/basket.hooks.ts

import { useQueryClient } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  getBasketService,
  UserDiscountCodeItem,
  BasketShipmentMethodItem,
  SamanPaymentCallbackParams,
} from '../services/basket.service';
import { AddToBasketRequest, DeleteFromBasketRequest } from '../types/view.types';

const basketService = getBasketService();

export function useGetBasket() {
  return useTypedQuery(
    queryKeys.front.basket.current,
    () => basketService.getBasket(),
    {
      staleTime: 0, // تغییر حیاتی: دیتا هرگز تاریخ‌گذشته فرض نشود تا همیشه آخرین وضعیت محاسبه شده بیاید
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
      },
    }
  );
}

export function useGetUserLocations() {
  return useTypedQuery(
    ['user', 'locations'],
    () => basketService.getUserLocations(),
    {
      staleTime: 0, // تغییر حیاتی: آدرس‌ها همیشه بلافاصله واکشی شوند
      refetchOnWindowFocus: false,
    }
  );
}

export function useCreateUserLocation() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (formData: FormData) => basketService.createUserLocation(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'locations'] });
      },
    }
  );
}

export function useUpdateUserLocation() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (formData: FormData) => basketService.updateUserLocation(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'locations'] });
      },
    }
  );
}

export function useDeleteUserLocation() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (id: string) => basketService.deleteUserLocation(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'locations'] });
      },
    }
  );
}

export function useGetCheckoutBasket() {
  return useTypedQuery(
    ['front', 'basket', 'checkout'],
    () => basketService.getCheckoutBasket(),
    {
      staleTime: 0,
      refetchOnWindowFocus: false,
    }
  );
}

export function useSetBasketLocationAndPrice() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (locationId: string) => basketService.setBasketLocationAndPrice(locationId),
    {
      onSuccess: (response: any) => {
        // استخراج هوشمند آبجکت سبد از هر نوع ساختار پاسخی
        const basketData =
          response?.basket ||
          response?.data?.basket ||
          response?.data ||
          response;

        if (basketData && (basketData.subBaskets || basketData.id)) {
          queryClient.setQueryData(queryKeys.front.basket.current, basketData);
          queryClient.setQueryData(['front', 'basket', 'checkout'], basketData);
        }
      },
    }
  );
}

export function useChangeBasketLocation() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (locationId: string) => basketService.setBasketLocationAndPrice(locationId),
    {
      onSuccess: (data) => {
        const updated = data?.basket || data?.data || data;
        if (updated) {
          queryClient.setQueryData(queryKeys.front.basket.current, updated);
          queryClient.setQueryData(['front', 'basket', 'checkout'], updated);
        }
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
      },
    }
  );
}

export function useSetBasketShipment() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (methods: BasketShipmentMethodItem[]) => basketService.setBasketShipment(methods),
    {
      onSuccess: (data) => {
        const updated = data?.basket || data?.data || data;
        if (updated) {
          queryClient.setQueryData(queryKeys.front.basket.current, updated);
          queryClient.setQueryData(['front', 'basket', 'checkout'], updated);
        }
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
      },
    }
  );
}

export function useInitiatePayment() {
  return useTypedMutation(
    (isLegalReceipt: boolean) => basketService.initiatePayment(isLegalReceipt)
  );
}

export function useApplyDiscountCode() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (code: string) => basketService.applyDiscountCode(code),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
      },
    }
  );
}

export function useApplyReferralCode() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (code: string) => basketService.applyReferralCode(code),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
      },
    }
  );
}

export function useGetUserDiscountCodes() {
  return useTypedQuery<UserDiscountCodeItem[]>(
    ['user', 'discount-codes'],
    () => basketService.getUserDiscountCodes(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useCheckoutBasket() {
  const queryClient = useQueryClient();
  return useTypedMutation<any, void>(
    () => basketService.checkoutBasket(),
    {
      onSuccess: (data) => {
        const updated = data?.basket || data?.data || data;
        if (updated) {
          queryClient.setQueryData(queryKeys.front.basket.current, updated);
          queryClient.setQueryData(['front', 'basket', 'checkout'], updated);
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
      },
    }
  );
}

export function useVerifySamanPayment() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (params: SamanPaymentCallbackParams) => basketService.verifySamanPayment(params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
      },
    }
  );
}