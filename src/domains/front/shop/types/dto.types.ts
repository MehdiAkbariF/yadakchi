// src/domains/front/shop/types/dto.types.ts

export interface ShopApiDto {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  followerCount: number;
  isVerified: boolean;
  isActive: boolean;
  cityId: string;
  cityName: string;
  provinceId: string;
  provinceName: string;
  address: string;
  phoneNumber: string;
  website?: string;
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface ShopCardApiDto {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  isVerified: boolean;
  cityName: string;
  rank: number;
}

export interface BestShopApiDto {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  rank: number;
}

export interface ShopReportSubjectApiDto {
  id: string;
  title: string;
  description: string;
}

export interface ShopReportRequestDto {
  shopId: string;
  shopProductId?: string;
  description: string;
  reportSubjectId: string;
}

export interface ShopPerformanceApiDto {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  averageRating: number;
  totalReviews: number;
  salesGrowth: number;
  ordersGrowth: number;
  viewsGrowth: number;
  monthlySales: Array<{
    month: string;
    amount: number;
  }>;
}