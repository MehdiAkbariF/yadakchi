export interface Product {
  id: string;
  shopProductId?: string;
  code: number;
  name: ProductName;
  description: string;
  price: Money;
  discount: Discount | null;
  images: Image[];
  category: Category;
  brand: Brand;
  shop: Shop;
  inventory: Inventory;
  type: ProductType;
  metadata: ProductMetadata;
  rating: Rating;
  statistics: ProductStatistics;
  isFavorite: boolean;
}

export interface ProductName {
  value: string;
  english: string;
}

export interface Money {
  amount: number;
  currency: 'IRR' | 'USD' | 'EUR';
}

export interface Discount {
  percent: number;
  expirationDate: Date | null;
  originalPrice: Money;
}

export interface Image {
  url: string;
  alt: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  englishTitle: string;
}

export interface Brand {
  id: string;
  name: string;
  englishTitle: string;
}

export interface Shop {
  id: string;
  name: string;
  rating: number;
}

export interface Inventory {
  isInStock: boolean;
  count: number;
}

export type ProductType = 'NEW' | 'STOCK' | 'TAKEOFF';

export interface ProductMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  average: number;
  count: number;
}

export interface ProductStatistics {
  views: number;
  commentCount: number;
  inquiryCount: number;
}