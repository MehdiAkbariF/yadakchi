// src/domains/front/basket/types/dto.types.ts

export interface BasketItemApiDto {
  shopProductId: string;
  productId: string;
  productName: string;
  productCode: number;
  productImage: string;
  shopId: string;
  shopName: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  hasDiscount: boolean;
  discountPercent?: number;
  maxQuantity: number;
  isInStock: boolean;
  type: 'New' | 'Stock' | 'TakeOff';
}

export interface BasketApiDto {
  id: string;
  userId: string;
  items: BasketItemApiDto[];
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToBasketRequestDto {
  shopProductId: string;
  quantity: number;
}

export interface DeleteFromBasketRequestDto {
  shopProductId: string;
  quantity: number;
}