// src/domains/front/shop/mappers/shop.mapper.ts

import { 
  ShopApiDto, 
  ShopCardApiDto, 
  ShopPerformanceApiDto,
} from '../types/dto.types';
import { 
  Shop,
} from '../types/domain.types';
import { 
  ShopViewModel, 
  ShopCardViewModel, 
  ShopPerformanceViewModel,
} from '../types/view.types';

export class ShopMapper {
  static toDomain(dto: ShopApiDto): Shop {
    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      description: dto.description,
      logo: dto.logo,
      coverImage: dto.coverImage,
      rating: {
        average: dto.rating,
        count: dto.reviewCount,
      },
      statistics: {
        productCount: dto.productCount,
        followerCount: dto.followerCount,
        totalOrders: 0,
        totalSales: 0,
      },
      location: {
        cityId: dto.cityId,
        cityName: dto.cityName,
        provinceId: dto.provinceId,
        provinceName: dto.provinceName,
        address: dto.address,
      },
      contact: {
        phoneNumber: dto.phoneNumber,
        website: dto.website,
      },
      socialMedia: {
        instagram: dto.instagram,
        telegram: dto.telegram,
        whatsapp: dto.whatsapp,
      },
      verification: {
        isVerified: dto.isVerified,
        isActive: dto.isActive,
      },
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
      isFavorite: dto.isFavorite || false,
    };
  }

  static toView(domain: Shop): ShopViewModel {
    const memberSince = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(domain.metadata.createdAt);

    return {
      id: domain.id,
      name: domain.name,
      englishTitle: domain.englishTitle,
      description: domain.description,
      logo: domain.logo,
      coverImage: domain.coverImage,
      rating: {
        average: domain.rating.average,
        count: domain.rating.count,
        stars: Math.round(domain.rating.average),
        percentage: (domain.rating.average / 5) * 100,
      },
      statistics: {
        productCount: domain.statistics.productCount,
        productCountFormatted: this.formatNumber(domain.statistics.productCount),
        followerCount: domain.statistics.followerCount,
        followerCountFormatted: this.formatNumber(domain.statistics.followerCount),
        totalOrders: domain.statistics.totalOrders,
        totalSales: this.formatNumber(domain.statistics.totalSales) + ' تومان',
      },
      location: {
        cityName: domain.location.cityName,
        provinceName: domain.location.provinceName,
        address: domain.location.address,
        fullAddress: `${domain.location.cityName}، ${domain.location.address}`,
      },
      contact: {
        phoneNumber: domain.contact.phoneNumber,
        website: domain.contact.website || null,
      },
      socialMedia: {
        instagram: domain.socialMedia.instagram || null,
        telegram: domain.socialMedia.telegram || null,
        whatsapp: domain.socialMedia.whatsapp || null,
      },
      verification: {
        isVerified: domain.verification.isVerified,
        isActive: domain.verification.isActive,
        badgeText: domain.verification.isVerified ? 'تایید شده' : 'در انتظار تایید',
        badgeColor: domain.verification.isVerified ? 'success' : 'warning',
      },
      metadata: {
        createdAt: domain.metadata.createdAt.toISOString(),
        updatedAt: domain.metadata.updatedAt.toISOString(),
        memberSince,
      },
      isFavorite: domain.isFavorite,
    };
  }

  static toViewCard(dto: ShopCardApiDto): ShopCardViewModel {
    return {
      id: dto.id,
      name: dto.name,
      logo: dto.logo,
      rating: dto.rating,
      reviewCount: dto.reviewCount,
      reviewCountFormatted: this.formatNumber(dto.reviewCount),
      productCount: dto.productCount,
      productCountFormatted: this.formatNumber(dto.productCount),
      isVerified: dto.isVerified,
      cityName: dto.cityName,
      rank: dto.rank,
      rankLabel: `رتبه ${dto.rank}`,
    };
  }

  static toViewPerformance(dto: ShopPerformanceApiDto): ShopPerformanceViewModel {
    const stats = [
      {
        label: 'فروش کل',
        value: this.formatNumber(dto.totalSales) + ' تومان',
        change: dto.salesGrowth,
        icon: '💰',
      },
      {
        label: 'تعداد سفارشات',
        value: this.formatNumber(dto.totalOrders),
        change: dto.ordersGrowth,
        icon: '📦',
      },
      {
        label: 'تعداد محصولات',
        value: this.formatNumber(dto.totalProducts),
        change: undefined,
        icon: '📦',
      },
      {
        label: 'میانگین امتیاز',
        value: dto.averageRating.toFixed(1),
        change: undefined,
        icon: '⭐',
      },
    ];

    return {
      totalSales: this.formatNumber(dto.totalSales) + ' تومان',
      totalOrders: dto.totalOrders,
      totalOrdersFormatted: this.formatNumber(dto.totalOrders),
      totalProducts: dto.totalProducts,
      totalProductsFormatted: this.formatNumber(dto.totalProducts),
      totalViews: dto.totalViews,
      totalViewsFormatted: this.formatNumber(dto.totalViews),
      averageRating: dto.averageRating,
      totalReviews: dto.totalReviews,
      totalReviewsFormatted: this.formatNumber(dto.totalReviews),
      salesGrowth: dto.salesGrowth,
      ordersGrowth: dto.ordersGrowth,
      viewsGrowth: dto.viewsGrowth,
      monthlySales: dto.monthlySales.map(s => ({
        month: s.month,
        amount: this.formatNumber(s.amount) + ' تومان',
      })),
      stats,
    };
  }

  private static formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }
}