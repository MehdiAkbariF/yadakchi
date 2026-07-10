// src/domains/front/product/mappers/product.mapper.ts

import { ProductApiDto, SearchProductsRequestDto, ProductPriceChartApiDto } from '../types/dto.types';
import { Product, Money, Discount, Image } from '../types/domain.types';
import { ProductViewModel, SearchProductsRequest, ProductPriceChartViewModel } from '../types/view.types';

export class ProductMapper {
  static toDomain(dto: ProductApiDto): Product {
    const price: Money = {
      amount: dto.price,
      currency: 'IRR',
    };

    let discount: Discount | null = null;
    if (dto.hasDiscount && dto.discountPrice) {
      discount = {
        percent: Math.round(((dto.price - dto.discountPrice) / dto.price) * 100),
        expirationDate: dto.discountExpiration ? new Date(dto.discountExpiration) : null,
        originalPrice: price,
      };
    }

    const images: Image[] = dto.images.map((url, index) => ({
      url,
      alt: dto.name,
      order: index,
    }));

    return {
      id: dto.id,
      code: dto.code,
      name: {
        value: dto.name,
        english: dto.englishTitle,
      },
      description: dto.description,
      price,
      discount,
      images,
      category: {
        id: dto.categoryId,
        name: dto.categoryName,
        englishTitle: dto.categoryName,
      },
      brand: {
        id: dto.brandId,
        name: dto.brandName,
        englishTitle: dto.brandName,
      },
      shop: {
        id: dto.shopId,
        name: dto.shopName,
        rating: dto.shopRating,
      },
      inventory: {
        isInStock: dto.isInStock,
        count: dto.stockCount,
      },
      type: dto.type.toUpperCase() as 'NEW' | 'STOCK' | 'TAKEOFF',
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
      rating: {
        average: dto.rating,
        count: dto.commentCount,
      },
      statistics: {
        views: dto.views,
        commentCount: dto.commentCount,
        inquiryCount: dto.inquiryCount,
      },
      isFavorite: dto.isFavorite || false,
    };
  }

  static toView(domain: Product): ProductViewModel {
    const priceInToman = domain.price.amount / 10;
    const discountedPrice = domain.discount 
      ? (domain.price.amount * (1 - domain.discount.percent / 100)) / 10
      : null;

    return {
      id: domain.id,
      code: domain.code,
      name: domain.name.value,
      englishTitle: domain.name.english,
      description: domain.description,
      price: {
        raw: domain.price.amount,
        formatted: this.formatNumber(domain.price.amount),
        toman: priceInToman,
        formattedToman: this.formatNumber(priceInToman) + ' تومان',
      },
      discount: {
        hasDiscount: !!domain.discount,
        percent: domain.discount?.percent || 0,
        originalPrice: domain.discount ? this.formatNumber(domain.discount.originalPrice.amount / 10) + ' تومان' : '',
        discountedPrice: domain.discount ? this.formatNumber(discountedPrice!) + ' تومان' : '',
        expirationDate: domain.discount?.expirationDate?.toISOString() || null,
        isActive: domain.discount?.expirationDate ? domain.discount.expirationDate > new Date() : true,
      },
      images: domain.images.map(img => ({
        thumbnail: img.url + '?w=200&h=200',
        medium: img.url + '?w=400&h=400',
        large: img.url + '?w=800&h=800',
        alt: img.alt,
      })),
      category: domain.category,
      brand: domain.brand,
      shop: {
        ...domain.shop,
        ratingStars: Math.round(domain.shop.rating),
      },
      inventory: {
        isInStock: domain.inventory.isInStock,
        count: domain.inventory.count,
        status: domain.inventory.count > 10 ? 'AVAILABLE' : domain.inventory.count > 0 ? 'LIMITED' : 'OUT_OF_STOCK',
        statusText: domain.inventory.count > 10 ? 'موجود' : domain.inventory.count > 0 ? 'تعداد محدود' : 'ناموجود',
      },
      type: {
        value: domain.type,
        label: domain.type === 'NEW' ? 'جدید' : domain.type === 'STOCK' ? 'موجود' : 'حراج',
        badge: domain.type === 'NEW' ? 'success' : domain.type === 'STOCK' ? 'info' : 'warning',
      },
      metadata: {
        createdAt: domain.metadata.createdAt.toISOString(),
        updatedAt: domain.metadata.updatedAt.toISOString(),
        isNew: this.isNew(domain.metadata.createdAt),
        isRecentlyUpdated: this.isRecentlyUpdated(domain.metadata.updatedAt),
      },
      rating: {
        average: domain.rating.average,
        count: domain.rating.count,
        stars: Math.round(domain.rating.average),
        percentage: (domain.rating.average / 5) * 100,
      },
      statistics: {
        views: domain.statistics.views,
        viewsFormatted: this.formatNumber(domain.statistics.views),
        commentCount: domain.statistics.commentCount,
        inquiryCount: domain.statistics.inquiryCount,
        popularity: domain.statistics.views > 1000 ? 'HIGH' : domain.statistics.views > 100 ? 'MEDIUM' : 'LOW',
        popularityText: domain.statistics.views > 1000 ? 'پرطرفدار' : domain.statistics.views > 100 ? 'متوسط' : 'کم بازدید',
      },
      isFavorite: domain.isFavorite,
    };
  }

  static toDomainSearchRequest(request: SearchProductsRequest): SearchProductsRequestDto {
    return {
      searchTitle: request.searchTitle,
      isProductInStock: request.isProductInStock,
      isSellerInUserCity: request.isSellerInUserCity,
      types: request.types,
      partCategoryIds: request.partCategoryIds,
      partCategoryEnglishTitle: request.partCategoryEnglishTitle,
      partEnglishTitle: request.partEnglishTitle,
      carModel: request.carModel,
      carIds: request.carIds,
      partIds: request.partIds,
      brandIds: request.brandIds,
      shopId: request.shopId,
      cityId: request.cityId,
      hasDiscount: request.hasDiscount,
      hasDiscountWithExpiration: request.hasDiscountWithExpiration,
      fromPrice: request.fromPrice,
      toPrice: request.toPrice,
      orderType: request.orderType,
      productDetails: request.productDetails,
      productCode: request.productCode,
      samePartByProductCode: request.samePartByProductCode,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 30,
    };
  }

  static toViewPriceChart(dto: ProductPriceChartApiDto): ProductPriceChartViewModel {
    return {
      dates: dto.dates.map(d => new Date(d).toLocaleDateString('fa-IR')),
      prices: dto.prices.map(p => p / 10),
      averagePrice: dto.averagePrice / 10,
      minPrice: dto.minPrice / 10,
      maxPrice: dto.maxPrice / 10,
    };
  }

  private static formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  private static isNew(date: Date): boolean {
    const diff = Date.now() - date.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }

  private static isRecentlyUpdated(date: Date): boolean {
    const diff = Date.now() - date.getTime();
    return diff < 24 * 60 * 60 * 1000;
  }
}