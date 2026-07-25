import { Product, Money, Discount, Image } from '@/domains/front/product/types/domain.types';
import { 
  ProductViewModel, 
  SearchProductsRequest, 
  ProductPriceChartViewModel,
  ProductPageViewModel,
  ProductDetailsViewModel,
  ShopProductViewModel,
  PriceChartViewModel,
  CommentsAverageViewModel,
  CommentItemViewModel,
  InquiryItemViewModel
} from '@/domains/front/product/types/view.types';
import { 
  ProductPageResponseDto, 
  PriceChartDto, 
  CommentsAverageDto, 
  CommentItemDto, 
  InquiryItemDto,
  ProductDto,
  ShopProductDto
} from '../types/dto.types';
import { getProductUrl } from '@/core/utils/formatters';

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
        logo: dto.brandLogo || null,
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
        href: `/part-category/${dto.partCategoryEnglishTitle}`,
      },
    };
  }

  static toViewProductPage(dto: ProductPageResponseDto): ProductPageViewModel | null {
    if (!dto || !dto.product) {
      return null;
    }
    return {
      product: this.toViewProductDetails(dto.product),
      shopProducts: {
        newNominated: dto.shopProducts?.newNominatedShopProduct ? this.toViewShopProduct(dto.shopProducts.newNominatedShopProduct) : null,
        newOnline: (dto.shopProducts?.newOnlineShopProducts || []).map(p => this.toViewShopProduct(p)),
        newLocal: (dto.shopProducts?.newLocalShopProducts || []).map(p => this.toViewShopProduct(p)),
        takeOffNominated: dto.shopProducts?.takeOffNominatedShopProduct ? this.toViewShopProduct(dto.shopProducts.takeOffNominatedShopProduct) : null,
        takeOffOnline: (dto.shopProducts?.takeOffOnlineShopProducts || []).map(p => this.toViewShopProduct(p)),
        takeOffLocal: (dto.shopProducts?.takeOffLocalShopProducts || []).map(p => this.toViewShopProduct(p)),
        stockNominated: dto.shopProducts?.stockNominatedShopProduct ? this.toViewShopProduct(dto.shopProducts.stockNominatedShopProduct) : null,
        stockOnline: (dto.shopProducts?.stockOnlineShopProducts || []).map(p => this.toViewShopProduct(p)),
        stockLocal: (dto.shopProducts?.stockLocalShopProducts || []).map(p => this.toViewShopProduct(p))
      }
    };
  }

  static toViewProductDetails(dto: ProductDto): ProductDetailsViewModel {
    return {
      id: dto.id,
      code: dto.productCode,
      title: dto.title,
      image: dto.image,
      imageAlt: dto.imageAlt,
      description: dto.description,
      partNumber: dto.partNumber,
      averageRate: dto.averageRate,
      rateCount: dto.rateCount,
      views: this.formatNumber(dto.views),
      salesCount: this.formatNumber(dto.totalSalesCount),
      brand: {
        id: dto.brand?.id || '',
        name: dto.brand?.name || '',
        englishTitle: dto.brand?.englishTitle || '',
        logo: dto.brand?.image || null
      },
      cars: (dto.cars || []).map(c => ({
        id: c.id,
        model: c.model,
        englishTitle: c.englishTitle,
        cover: c.cover
      })),
      gallery: dto.productImageGallery || [],
      specGroups: (dto.productDetails || []).map(g => ({
        name: g.name,
        specs: (g.productDetails || []).map(s => ({
          name: s.name,
          value: s.value,
          isMain: s.isMain
        }))
      })),
      seo: {
        title: dto.seoInformation?.title || '',
        description: dto.seoInformation?.description || ''
      },
      breadCrumbs: (dto.breadCrumbs || []).map(b => ({
        id: b.id,
        title: b.title,
        englishTitle: b.englishTitle,
        url: getProductUrl(dto.productCode, dto.title)
      }))
    };
  }

  static toViewShopProduct(dto: ShopProductDto): ShopProductViewModel {
    const isDiscountActive = dto.rialRetailPrice > dto.finalRialPrice;
    return {
      id: dto.id,
      quantity: dto.quantity,
      retailPrice: this.formatPrice(dto.rialRetailPrice / 10) + ' تومان',
      finalPrice: this.formatPrice(dto.finalRialPrice / 10) + ' تومان',
      retailPriceRaw: dto.rialRetailPrice,
      finalPriceRaw: dto.finalRialPrice,
      discountPercentage: dto.discountPercentage,
      hasDiscount: isDiscountActive,
      type: dto.type,
      typeLabel: dto.type === 'New' ? 'قطعه نو' : dto.type === 'Stock' ? 'قطعه استوک' : 'قطعه زیرصفری',
      isAdvertised: dto.isAdvertised,
      isLocalSale: dto.isLocalSale,
      isTipaxShipping: dto.isTipaxShipping,
      isDirectShipping: dto.isDirectShipping,
      dayOfDelivery: dto.dayOfDelivery,
      dayOfDeliveryLabel: `ارسال ${this.formatNumber(dto.dayOfDelivery)} روزه فروشنده`,
      shop: {
        id: dto.shop?.id || '',
        title: dto.shop?.shopTitle || '',
        latitude: dto.shop?.latitude || 0,
        longitude: dto.shop?.longitude || 0,
        address: dto.shop?.address || '',
        phone: dto.shop?.tell || null,
        averageRate: dto.shop?.averageRate || 0,
        logo: dto.shop?.logo || null
      },
      warrantyTitle: dto.warrantySupport?.title || 'بدون گارانتی'
    };
  }

  static toViewCommentsAverage(dto: CommentsAverageDto): CommentsAverageViewModel {
    const total = dto.allRatesCount || 1;
    return {
      averageRate: dto.averageRate,
      allRatesCount: dto.allRatesCount,
      allCommentsCount: dto.allCommentsCount,
      allInquiriesCount: dto.allInquiriesCount,
      starPercentages: {
        five: Math.round((dto.fiveStarRatesCount / total) * 100),
        four: Math.round((dto.fourStarRatesCount / total) * 100),
        three: Math.round((dto.threeStarRatesCount / total) * 100),
        two: Math.round((dto.twoStarRatesCount / total) * 100),
        one: Math.round((dto.oneStarRatesCount / total) * 100)
      }
    };
  }

  static toViewCommentItem(dto: CommentItemDto): CommentItemViewModel {
    return {
      id: dto.id,
      comment: dto.comment,
      rate: dto.rate,
      creator: dto.commentCreator,
      likes: dto.likes,
      dislikes: dto.dislikes,
      repliesCount: dto.repliesCount,
      createDateFormatted: new Date(dto.createDate).toLocaleDateString('fa-IR'),
      isSellerComment: dto.isSellerComment,
      isBuyerUser: dto.isBuyerUser,
      isYourComment: dto.isYourComment,
      userBoughtFrom: dto.userBoughtFrom,
      userLiked: dto.userLiked,
      userDisLiked: dto.userDisLiked
    };
  }

  static toViewInquiryItem(dto: InquiryItemDto): InquiryItemViewModel {
    return {
      id: dto.id,
      comment: dto.comment,
      creator: dto.inquiryCreator,
      replyCount: dto.replyCount,
      likes: dto.likes,
      dislikes: dto.dislikes,
      isSellerComment: dto.isSellerComment,
      isBuyerUser: dto.isBuyerUser,
      isYourComment: dto.isYourComment,
      createDateFormatted: new Date(dto.createDate).toLocaleDateString('fa-IR'),
      userLiked: dto.userLiked,
      userDisLiked: dto.userDisLiked,
      bestReply: dto.bestReply ? this.toViewInquiryItem(dto.bestReply) : null
    };
  }

  private static formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }

  private static formatPrice(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(Math.round(value));
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