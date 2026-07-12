// src/domains/front/banner/services/banner.service.ts

import { getHttpClient } from '@/core/http/client';
import { logger } from '@/core/utils/logger';
import { BANNER_ENDPOINTS, BannerPageName } from '../endpoints/banner.endpoints';
import { BannerMapper } from '../mappers/banner.mapper';
import { BannerClickRequest, BannerViewRequest } from '../types/view.types';
import { 
  BannerApiDto, 
  ShopProductBannerApiDto,
  MegaMenuResponseApiDto,
  FrontFooterApiDto
} from '../types/dto.types';
import { 
  ShopProductBannerViewModel,
  MegaMenuCategoryViewModel,
  FrontFooterViewModel
} from '../types/view.types';

export class BannerService {
  private readonly httpClient = getHttpClient();

  async getBanners(pageName: BannerPageName): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        BANNER_ENDPOINTS.GET_BANNERS,
        { params: { YadakchiPageName: pageName } }
      );

      return response.data;
    } catch (error) {
      logger.error('[BannerService] Get banners failed:', error);
      // رفع باگ کلیدی: پرتاب خطا به جای بازگرداندن آرایه خالی برای ایجاد قابلیت فال‌بک روی کلاینت
      throw error; 
    }
  }

  async getShopProductBanners(params: {
    partCategoryId?: string;
    partId?: string;
    carId?: string;
  }): Promise<ShopProductBannerViewModel[]> {
    try {
      const response = await this.httpClient.get<ShopProductBannerApiDto[]>(
        BANNER_ENDPOINTS.GET_SHOP_PRODUCT_BANNERS,
        { params }
      );

      return response.data.map(dto => BannerMapper.toViewShopProduct(dto));
    } catch (error) {
      logger.error('[BannerService] Get shop product banners failed:', error);
      throw error;
    }
  }

  async getMegaMenu(): Promise<MegaMenuCategoryViewModel[]> {
    try {
      const response = await this.httpClient.get<MegaMenuResponseApiDto>(
        BANNER_ENDPOINTS.GET_MEGA_MENU
      );

      if (!response.data || !response.data.partCategories) {
        return [];
      }

      return response.data.partCategories.map(dto => BannerMapper.toViewMegaMenu(dto));
    } catch (error) {
      logger.error('[BannerService] Get mega menu failed:', error);
      throw error;
    }
  }

  async getFrontFooter(): Promise<FrontFooterViewModel | null> {
    try {
      const response = await this.httpClient.get<FrontFooterApiDto>(
        BANNER_ENDPOINTS.GET_FRONT_FOOTER
      );

      return BannerMapper.toViewFooter(response.data);
    } catch (error) {
      logger.error('[BannerService] Get front footer failed:', error);
      throw error;
    }
  }

  async trackBannerClick(request: BannerClickRequest): Promise<void> {
    try {
      const dto = BannerMapper.toClickRequest(request);
      await this.httpClient.post(BANNER_ENDPOINTS.POST_BANNER_CLICK, dto);
    } catch (error) {
      logger.error('[BannerService] Track banner click failed:', error);
    }
  }

  async trackBannerView(request: BannerViewRequest): Promise<void> {
    try {
      const dto = BannerMapper.toViewRequest(request);
      await this.httpClient.post(BANNER_ENDPOINTS.POST_BANNER_VIEW, dto);
    } catch (error) {
      logger.error('[BannerService] Track banner view failed:', error);
    }
  }
}

let bannerServiceInstance: BannerService | null = null;

export function getBannerService(): BannerService {
  if (!bannerServiceInstance) {
    bannerServiceInstance = new BannerService();
  }
  return bannerServiceInstance;
}