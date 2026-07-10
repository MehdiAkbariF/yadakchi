// src/domains/front/basket/types/domain.types.ts

export interface Basket {
  id: string;
  userId: string;
  items: BasketItem[];
  total: BasketTotal;
  summary: BasketSummary;
  metadata: BasketMetadata;
}

export interface BasketItem {
  shopProductId: string;
  product: BasketProduct;
  shop: BasketShop;
  quantity: number;
  price: BasketPrice;
  inventory: BasketInventory;
  type: 'NEW' | 'STOCK' | 'TAKEOFF';
}

export interface BasketProduct {
  id: string;
  name: string;
  code: number;
  image: string;
}

export interface BasketShop {
  id: string;
  name: string;
}

export interface BasketPrice {
  unitPrice: number;
  discountPrice?: number;
  hasDiscount: boolean;
  discountPercent?: number;
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
}

export interface BasketInventory {
  maxQuantity: number;
  isInStock: boolean;
}

export interface BasketTotal {
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
}

export interface BasketSummary {
  itemCount: number;
  shopCount: number;
  uniqueProductCount: number;
}

export interface BasketMetadata {
  createdAt: Date;
  updatedAt: Date;
}