// src/domains/front/banner/mappers/banner.mapper.ts

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

  static toViewShopProduct(dto: ShopProductBannerApiDto): ShopProductBannerViewModel {
    const price = dto.price / 10;
    const discountPrice = dto.discountPrice ? dto.discountPrice / 10 : null;
    const discountPercent = dto.hasDiscount && dto.discountPrice 
      ? Math.round(((dto.price - dto.discountPrice) / dto.price) * 100)
      : null;

    return {
      id: dto.id,
      title: dto.title,
      imageUrl: dto.imageUrl,
      link: dto.linkUrl || null,
      product: {
        id: dto.shopProductId,
        name: dto.productName,
        code: dto.productCode,
        shopName: dto.shopName,
        price: {
          raw: dto.price,
          formatted: new Intl.NumberFormat('fa-IR').format(dto.price),
          toman: new Intl.NumberFormat('fa-IR').format(price) + ' تومان',
        },
        discount: {
          hasDiscount: dto.hasDiscount,
          discountPrice: discountPrice ? new Intl.NumberFormat('fa-IR').format(discountPrice) + ' تومان' : null,
          discountPercent,
        },
      },
      position: dto.position,
    };
  }

  // متد مپ مگا منو با اضافه کردن هوشمندانه آدرس سرور اصلی برای تصاویر نسبی
  static toViewMegaMenu(dto: MegaMenuCategoryApiDto): MegaMenuCategoryViewModel {
    // اگر env.apiBaseUrl خالی باشد، از سرور اصلی شما به عنوان آدرس پایه استفاده می‌شود
    const apiBase = env.apiBaseUrl || 'http://51.158.252.139:45064';
    
    const categoryIcon = dto.icon 
      ? (dto.icon.startsWith('http') ? dto.icon : `${apiBase}${dto.icon}`)
      : null;

    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      icon: categoryIcon,
      href: `/categories/${dto.englishTitle}`,
      parts: (dto.parts || []).map(part => {
        const partIcon = part.icon 
          ? (part.icon.startsWith('http') ? part.icon : `${apiBase}${part.icon}`)
          : null;

        return {
          id: part.id,
          name: part.name,
          englishTitle: part.englishTitle,
          icon: partIcon,
          iconAlt: part.iconAlt || null,
          href: `/search?partEnglishTitle=${part.englishTitle}`,
        };
      }),
    };
  }

  static toViewFooter(dto: FrontFooterApiDto): FrontFooterViewModel {
    return {
      title: dto.title,
      description: dto.description,
      links: dto.links.map(link => ({
        id: link.id,
        title: link.title,
        link: link.link,
        order: link.order,
      })),
      socialMedia: dto.socialMedia.map(sm => ({
        id: sm.id,
        name: sm.name,
        icon: sm.icon,
        link: sm.link,
        order: sm.order,
      })),
      contactInfo: dto.contactInfo.map(ci => ({
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