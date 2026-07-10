// src/domains/front/basket/types/view.types.ts

export interface BasketViewModel {
  id: string;
  items: BasketItemViewModel[];
  total: {
    totalPrice: string;
    totalDiscount: string;
    finalPrice: string;
    totalPriceRaw: number;
    totalDiscountRaw: number;
    finalPriceRaw: number;
  };
  summary: {
    itemCount: number;
    shopCount: number;
    uniqueProductCount: number;
  };
  isEmpty: boolean;
}

export interface BasketItemViewModel {
  shopProductId: string;
  product: {
    id: string;
    name: string;
    code: number;
    image: string;
  };
  shop: {
    id: string;
    name: string;
  };
  quantity: number;
  price: {
    unitPrice: string;
    discountPrice: string | null;
    hasDiscount: boolean;
    discountPercent: number | null;
    totalPrice: string;
    totalDiscount: string;
    finalPrice: string;
    unitPriceRaw: number;
    discountPriceRaw: number | null;
    totalPriceRaw: number;
    totalDiscountRaw: number;
    finalPriceRaw: number;
  };
  inventory: {
    maxQuantity: number;
    isInStock: boolean;
    statusText: string;
  };
  type: {
    value: 'NEW' | 'STOCK' | 'TAKEOFF';
    label: string;
    badge: 'success' | 'info' | 'warning';
  };
  canIncrease: boolean;
  canDecrease: boolean;
}

export interface AddToBasketRequest {
  shopProductId: string;
  quantity: number;
}

export interface DeleteFromBasketRequest {
  shopProductId: string;
  quantity: number;
}