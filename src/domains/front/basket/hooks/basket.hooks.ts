// src/domains/front/basket/hooks/basket.hooks.ts

import { useQueryClient } from '@tanstack/react-query';
import { useTypedQuery, useTypedMutation } from '@/lib/react-query/hooks/base.hooks';
import { queryKeys } from '@/lib/react-query/query-keys';
import { getBasketService } from '../services/basket.service';
import { AddToBasketRequest, DeleteFromBasketRequest } from '../types/view.types';

const basketService = getBasketService();

/*
  بهینه‌سازی فوق‌پیشرفته و هوشمند کش سبد خرید (Layout-Wide Cache Optimization):
  مقدار staleTime به ۵ دقیقه افزایش یافته و refetchOnWindowFocus غیرفعال شده است.
  این کار باعث می‌شود در زمان تغییر مسیر یا گشت‌وگذار کاربر در سایت، هیچ درخواست پس‌زمینه‌ای
  برای سبد خرید ارسال نشود و جابجایی بین صفحات به صورت کاملاً آنی و ۶۰ فریم انجام شود.
  بروزرسانی واقعی کماکان هنگام افزودن/حذف کالا به صورت خودکار انجام خواهد شد.
*/
export function useGetBasket() {
  return useTypedQuery(
    queryKeys.front.basket.current,
    () => basketService.getBasket(),
    {
      staleTime: 5 * 60 * 1000, // ۵ دقیقه معتبر بودن داده‌ها برای جلوگیری از ریکوئست‌های تکراری مکرر
      refetchOnWindowFocus: false, // غیرفعال کردن ریکوئست مجدد هنگام تغییر فوکوس مرورگر
      refetchOnReconnect: false, // غیرفعال کردن ریکوئست مجدد هنگام قطع و وصل اینترنت
    }
  );
}

export function useAddToBasket() {
  const queryClient = useQueryClient();

  return useTypedMutation(
    (request: AddToBasketRequest) => basketService.addToBasket(request),
    {
      onSuccess: (data) => {
        // بروزرسانی آنی کش سبد خرید پس از افزودن کالا بدون نیاز به لود کل صفحه
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
        // بروزرسانی آنی کش سبد خرید پس از حذف کالا بدون نیاز به لود کل صفحه
        queryClient.setQueryData(queryKeys.front.basket.current, data);
        queryClient.invalidateQueries({
          queryKey: queryKeys.front.basket.current,
        });
      },
    }
  );
}

export function useGetUserLocations() {
  return useTypedQuery(
    ['user', 'locations'],
    () => basketService.getUserLocations(),
    {
      staleTime: 5 * 60 * 1000,
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
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
}

export function useChangeBasketLocation() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    (locationId: string) => basketService.changeBasketLocation(locationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
      },
    }
  );
}

export function useSetBasketShipment() {
  const queryClient = useQueryClient();
  return useTypedMutation(
    ({ locationId, methods }: { locationId: string; methods: any[] }) =>
      basketService.setBasketShipment(locationId, methods),
    {
      onSuccess: () => {
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

export function useCheckoutBasket() {
  const queryClient = useQueryClient();
  return useTypedMutation<any, void>(
    () => basketService.checkoutBasket(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.front.basket.current });
        queryClient.invalidateQueries({ queryKey: ['front', 'basket', 'checkout'] });
      },
    }
  );
}