// src/domains/front/shop/types/view.types.ts

// Export all types from this file
export interface ShopViewModel {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  logo: string;
  coverImage: string;
  rating: {
    average: number;
    count: number;
    stars: number;
    percentage: number;
  };
  statistics: {
    productCount: number;
    productCountFormatted: string;
    followerCount: number;
    followerCountFormatted: string;
    totalOrders: number;
    totalSales: string;
  };
  location: {
    cityName: string;
    provinceName: string;
    address: string;
    fullAddress: string;
  };
  contact: {
    phoneNumber: string;
    website: string | null;
  };
  socialMedia: {
    instagram: string | null;
    telegram: string | null;
    whatsapp: string | null;
  };
  verification: {
    isVerified: boolean;
    isActive: boolean;
    badgeText: string;
    badgeColor: 'success' | 'warning' | 'default';
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    memberSince: string;
  };
  isFavorite: boolean;
}

export interface ShopCardViewModel {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  reviewCountFormatted: string;
  productCount: number;
  productCountFormatted: string;
  isVerified: boolean;
  cityName: string;
  rank: number;
  rankLabel: string;
}

export interface ShopPerformanceViewModel {
  totalSales: string;
  totalOrders: number;
  totalOrdersFormatted: string;
  totalProducts: number;
  totalProductsFormatted: string;
  totalViews: number;
  totalViewsFormatted: string;
  averageRating: number;
  totalReviews: number;
  totalReviewsFormatted: string;
  salesGrowth: number;
  ordersGrowth: number;
  viewsGrowth: number;
  monthlySales: Array<{
    month: string;
    amount: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
    change?: number;
    icon: string;
  }>;
}

export interface ShopFilters {
  orderBy?: 'Rating' | 'Rank' | 'Oldest';
  carManufacturerIds?: string[];
  carIds?: string[];
  partIds?: string[];
  pageNumber?: number;
  pageSize?: number;
}

export interface ShopReportRequest {
  shopId: string;
  shopProductId?: string;
  description: string;
  reportSubjectId: string;
}