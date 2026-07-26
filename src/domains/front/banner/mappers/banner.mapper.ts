import { env } from '@/core/config/env';
import { 
  BannerApiDto, 
  ShopProductBannerApiDto,
  MegaMenuCategoryApiDto,
  FrontFooterApiDto,
  BannerClickRequestDto,
  BannerViewRequestDto
} from '../types/dto.types';
import { Banner } from '../types/domain.types';
import { 
  BannerViewModel, 
  ShopProductBannerViewModel,
  MegaMenuCategoryViewModel,
  FrontFooterViewModel,
  BannerClickRequest,
  BannerViewRequest
} from '../types/view.types';

export class BannerMapper {
  static toDomain(dto: BannerApiDto): Banner {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      link: dto.linkUrl,
      target: dto.target || '_self',
      position: dto.position,
      isActive: dto.isActive,
      pageName: dto.pageName,
      schedule: {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
    };
  }

  static toView(domain: Banner): BannerViewModel {
    const now = new Date();
    const isActive = domain.isActive && (
      (!domain.schedule.startDate || domain.schedule.startDate <= now) &&
      (!domain.schedule.endDate || domain.schedule.endDate >= now)
    );

    return {
      id: domain.id,
      title: domain.title,
      description: domain.description || null,
      imageUrl: domain.imageUrl,
      link: domain.link || null,
      target: domain.target,
      position: domain.position,
      pageName: domain.pageName,
      schedule: {
        startDate: domain.schedule.startDate?.toISOString() || null,
        endDate: domain.schedule.endDate?.toISOString() || null,
      },
      isActive,
    };
  }

  /**
   * مپر اختصاصی و منعطف بنرهای کالا و تبلیغات حمایتی
   * سازگار با ساختار پاسخ خام قدیمی و پاسخ ساختاریافته جدید حاوی ریال فینال پرایس و پروداکت تایتل
   */
  static toViewShopProduct(dto: any): ShopProductBannerViewModel {
    if (!dto) {
      return {
        id: '',
        title: '',
        imageUrl: '',
        link: null,
        product: {
          id: '',
          name: '',
          code: 0,
          shopName: '',
          price: { raw: 0, formatted: '۰', toman: '۰ تومان' },
          discount: { hasDiscount: false, discountPrice: null, discountPercent: null }
        },
        position: 0
      };
    }

    // استخراج قیمت خام اولیه و نهایی بر اساس فیلدهای مختلف هر دو ساختار API
    const originalPriceRaw = Number(dto.rialRetailPrice || dto.price || 0);
    const finalPriceRaw = Number(dto.rialFinalPrice || dto.discountPrice || originalPriceRaw);

    const price = finalPriceRaw / 10;
    const discountPrice = originalPriceRaw > finalPriceRaw ? finalPriceRaw / 10 : null;

    const hasDiscount = originalPriceRaw > finalPriceRaw;
    const discountPercent = hasDiscount
      ? Math.round(((originalPriceRaw - finalPriceRaw) / originalPriceRaw) * 100)
      : (dto.discountPercentage || 0);

    const productId = dto.shopProductId || dto.id || '';
    const productName = dto.productTitle || dto.productName || dto.title || '';
    const imageUrl = dto.image || dto.imageUrl || '';
    const shopName = dto.shopTitle || dto.shopName || 'یدکچی';
    const position = dto.position || 0;

    return {
      id: dto.id || productId,
      title: productName,
      imageUrl: imageUrl,
      link: dto.linkUrl || null,
      product: {
        id: productId,
        name: productName,
        code: dto.productCode || 0,
        shopName: shopName,
        price: {
          raw: finalPriceRaw,
          formatted: new Intl.NumberFormat('fa-IR').format(finalPriceRaw),
          toman: new Intl.NumberFormat('fa-IR').format(price) + ' تومان',
        },
        discount: {
          hasDiscount,
          discountPrice: discountPrice ? new Intl.NumberFormat('fa-IR').format(discountPrice) + ' تومان' : null,
          discountPercent: discountPercent > 0 ? discountPercent : null,
        },
      },
      position,
    };
  }

  static toViewMegaMenu(dto: MegaMenuCategoryApiDto): MegaMenuCategoryViewModel {
    const apiBase = (env.apiBaseUrl || 'https://api.yadakchi.com').replace(/\/$/, '');
    
    const getFullUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${apiBase}${cleanPath}`;
    };

    const categoryIcon = getFullUrl(dto.icon);

    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      icon: categoryIcon,
      href: `/part-category/${dto.englishTitle}`,
      parts: (dto.parts || []).map(part => {
        const partIcon = getFullUrl(part.icon);
        return {
          id: part.id,
          name: part.name,
          englishTitle: part.englishTitle,
          icon: partIcon,
          iconAlt: part.iconAlt || null,
          href: `/parts/${dto.englishTitle}/${part.englishTitle}`,
        };
      }),
    };
  }

  // مپ کردن کامپوننت فوتر به همراه سیستم ایمن‌سازی دفاعی در برابر داده‌های تهی/غایب سرور
  static toViewFooter(dto: FrontFooterApiDto): FrontFooterViewModel {
    if (!dto) {
      return {
        title: '',
        description: '',
        links: [],
        socialMedia: [],
        contactInfo: [],
      };
    }

    return {
      title: dto.title || '',
      description: dto.description || '',
      links: (dto.links || []).map(link => ({
        id: link.id,
        title: link.title,
        link: link.link,
        order: link.order,
      })),
      socialMedia: (dto.socialMedia || []).map(sm => ({
        id: sm.id,
        name: sm.name,
        icon: sm.icon,
        link: sm.link,
        order: sm.order,
      })),
      contactInfo: (dto.contactInfo || []).map(ci => ({
        id: ci.id,
        type: ci.type,
        value: ci.value,
        order: ci.order,
      })),
    };
  }

  static toClickRequest(request: BannerClickRequest): BannerClickRequestDto {
    return {
      bannerIds: request.bannerIds,
      shopProductIds: request.shopProductIds,
    };
  }

  static toViewRequest(request: BannerViewRequest): BannerViewRequestDto {
    return {
      bannerIds: request.bannerIds,
      shopProductIds: request.shopProductIds,
    };
  }
}