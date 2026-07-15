import { Product, Money, Discount, Image } from '@/domains/front/product/types/domain.types';
import { ProductViewModel, SearchProductsRequest, ProductPriceChartViewModel } from '@/domains/front/product/types/view.types';

export class ProductMapper {
  static toDomain(dto: any): Product {
    const nominated = dto.nominatedShopProduct || {};
    const rawPrice = dto.price || nominated.rialRetailPrice || nominated.price || 0;
    const rawFinalPrice = dto.discountPrice || nominated.rialFinalPrice || nominated.price || rawPrice;

    const price: Money = {
      amount: rawPrice,
      currency: 'IRR',
    };

    const hasDiscount = rawPrice > rawFinalPrice;
    let discount: Discount | null = null;
    if (hasDiscount) {
      discount = {
        percent: Math.round(((rawPrice - rawFinalPrice) / rawPrice) * 100),
        expirationDate: nominated.discountUntil || dto.discountExpiration ? new Date(nominated.discountUntil || dto.discountExpiration) : null,
        originalPrice: price,
      };
    }

    const images: Image[] = [];
    if (dto.image) {
      images.push({ url: dto.image, alt: dto.title || dto.name, order: 0 });
    } else if (dto.images && Array.isArray(dto.images)) {
      dto.images.forEach((url: string, index: number) => {
        images.push({ url, alt: dto.title || dto.name, order: index });
      });
    }

    return {
      id: dto.id,
      shopProductId: nominated.id || dto.shopProductId || '',
      code: dto.productCode || dto.code || 0,
      name: {
        value: dto.title || dto.name || '',
        english: dto.englishTitle || '',
      },
      description: dto.description || '',
      price,
      discount,
      images,
      category: {
        id: dto.categoryId || dto.partCategoryId || '',
        name: dto.categoryName || dto.partCategoryName || '',
        englishTitle: dto.categoryEnglishTitle || dto.partCategoryEnglishTitle || '',
      },
      brand: {
        id: dto.brandId || '',
        name: dto.brandName || '',
        englishTitle: dto.brandName || '',
      },
      shop: {
        id: nominated.shopId || dto.shopId || '',
        name: nominated.shopTitle || dto.shopName || '',
        rating: nominated.averageRate || dto.shopRating || 0,
      },
      inventory: {
        isInStock: dto.isInStock || nominated.quantity > 0 || false,
        count: dto.stockCount || nominated.quantity || 0,
      },
      type: (dto.type || nominated.type || 'NEW').toUpperCase() as 'NEW' | 'STOCK' | 'TAKEOFF',
      metadata: {
        createdAt: new Date(dto.createdAt || Date.now()),
        updatedAt: new Date(dto.updatedAt || Date.now()),
      },
      rating: {
        average: dto.averageRate || dto.rating || 5,
        count: dto.commentCount || 0,
      },
      statistics: {
        views: dto.viewsAndClicks || dto.views || 0,
        commentCount: dto.commentCount || 0,
        inquiryCount: dto.inquiryCount || 0,
      },
      isFavorite: dto.isFavorite || false,
    };
  }

  static toView(domain: Product): ProductViewModel {
    const priceInToman = domain.price.amount / 10;
    const discountedPrice = domain.discount 
      ? (domain.price.amount * (1 - domain.discount.percent / 100)) / 10
      : priceInToman;

    return {
      id: domain.id,
      shopProductId: domain.shopProductId || '',
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
        discountedPrice: domain.discount ? this.formatNumber(discountedPrice) + ' تومان' : '',
        expirationDate: domain.discount?.expirationDate?.toISOString() || null,
        isActive: domain.discount?.expirationDate ? domain.discount.expirationDate > new Date() : true,
      },
      images: domain.images.map(img => ({
        thumbnail: img.url,
        medium: img.url,
        large: img.url,
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

  static toDomainSearchRequest(request: SearchProductsRequest): any {
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

  static toViewPriceChart(dto: any): ProductPriceChartViewModel {
    return {
      dates: (dto.dates || []).map((d: string) => new Date(d).toLocaleDateString('fa-IR')),
      prices: (dto.prices || []).map((p: number) => p / 10),
      averagePrice: dto.averagePrice / 10,
      minPrice: dto.minPrice / 10,
      maxPrice: dto.maxPrice / 10,
    };
  }

  static toViewKeyword(dto: any): any {
    return {
      suggestion: dto.searchKeywordSuggestion,
      productTitles: dto.productTitles || [],
      part: {
        id: dto.partId,
        name: dto.partName,
        englishTitle: dto.partEnglishTitle,
        href: `/search?partEnglishTitle=${dto.partEnglishTitle}`,
      },
      category: {
        id: dto.partCategoryId,
        name: dto.partCategoryName,
        englishTitle: dto.partCategoryEnglishTitle,
        href: `/categories/${dto.partCategoryEnglishTitle}`,
      },
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