export interface ProductViewModel {
  id: string;
  shopProductId?: string;
  code: number;
  name: string;
  englishTitle: string;
  description: string;
  price: {
    raw: number;
    formatted: string;
    toman: number;
    formattedToman: string;
  };
  discount: {
    hasDiscount: boolean;
    percent: number;
    originalPrice: string;
    discountedPrice: string;
    expirationDate: string | null;
    isActive: boolean;
  };
  images: {
    thumbnail: string;
    medium: string;
    large: string;
    alt: string;
  }[];
  category: {
    id: string;
    name: string;
    englishTitle: string;
  };
  brand: {
    id: string;
    name: string;
    englishTitle: string;
  };
  shop: {
    id: string;
    name: string;
    rating: number;
    ratingStars: number;
  };
  inventory: {
    isInStock: boolean;
    count: number;
    status: 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK';
    statusText: string;
  };
  type: {
    value: 'NEW' | 'STOCK' | 'TAKEOFF';
    label: string;
    badge: 'success' | 'warning' | 'info';
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    isNew: boolean;
    isRecentlyUpdated: boolean;
  };
  rating: {
    average: number;
    count: number;
    stars: number;
    percentage: number;
  };
  statistics: {
    views: number;
    viewsFormatted: string;
    commentCount: number;
    inquiryCount: number;
    popularity: 'HIGH' | 'MEDIUM' | 'LOW';
    popularityText: string;
  };
  isFavorite: boolean;
}

export interface SearchProductsRequest {
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

export interface ProductPriceChartViewModel {
  dates: string[];
  prices: number[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}