// src/domains/front/product/types/dto.types.ts

export interface ProductApiDto {
  id: string;
  code: number;
  name: string;
  englishTitle: string;
  description: string;
  price: number;
  discountPrice?: number;
  hasDiscount: boolean;
  discountExpiration?: string;
  images: string[];
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  shopId: string;
  shopName: string;
  shopRating: number;
  isInStock: boolean;
  stockCount: number;
  type: 'New' | 'Stock' | 'TakeOff';
  createdAt: string;
  updatedAt: string;
  views: number;
  rating: number;
  commentCount: number;
  inquiryCount: number;
  isFavorite?: boolean;
}

// ساختار صحیح پاسخ API
export interface SearchProductsResponseDto {
  products: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    items: ProductApiDto[];
    searchParams: any;
  };
  minPrice: number;
  maxPrice: number;
  partCategorySellers: any[];
}

export interface SearchProductsRequestDto {
  searchTitle?: string;
  isProductInStock?: boolean;
  isSellerInUserCity?: boolean;
  types?: Array<'New' | 'Stock' | 'TakeOff'>;
  partCategoryIds?: string[];
  partCategoryEnglishTitle?: string;
  partEnglishTitle?: string;
  carModel?: string;
  carIds?: string[];
  partIds?: string[];
  brandIds?: string[];
  shopId?: string;
  cityId?: string;
  hasDiscount?: boolean;
  hasDiscountWithExpiration?: boolean;
  fromPrice?: number;
  toPrice?: number;
  orderType?: 'Selected' | 'MostVisited' | 'Newest' | 'BestSelling' | 'Cheapest' | 'MostExpensive' | 'HighestRated';
  productDetails?: string;
  productCode?: number;
  samePartByProductCode?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponseDto<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductPriceChartApiDto {
  dates: string[];
  prices: number[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}