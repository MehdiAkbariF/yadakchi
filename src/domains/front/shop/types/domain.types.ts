// src/domains/front/shop/types/domain.types.ts

export interface Shop {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  logo: string;
  coverImage: string;
  rating: ShopRating;
  statistics: ShopStatistics;
  location: ShopLocation;
  contact: ShopContact;
  socialMedia: ShopSocialMedia;
  verification: ShopVerification;
  metadata: ShopMetadata;
  isFavorite: boolean;
}

export interface ShopRating {
  average: number;
  count: number;
}

export interface ShopStatistics {
  productCount: number;
  followerCount: number;
  totalOrders: number;
  totalSales: number;
}

export interface ShopLocation {
  cityId: string;
  cityName: string;
  provinceId: string;
  provinceName: string;
  address: string;
}

export interface ShopContact {
  phoneNumber: string;
  website?: string;
}

export interface ShopSocialMedia {
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
}

export interface ShopVerification {
  isVerified: boolean;
  isActive: boolean;
}

export interface ShopMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopCard {
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

export interface ShopPerformance {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  averageRating: number;
  totalReviews: number;
  salesGrowth: number;
  ordersGrowth: number;
  viewsGrowth: number;
  monthlySales: MonthlySales[];
}

export interface MonthlySales {
  month: string;
  amount: number;
}