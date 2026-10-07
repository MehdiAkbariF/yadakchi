// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\domains\front\shop\services\shop.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { SHOP_ENDPOINTS } from '../endpoints/shop.endpoints';
import { ShopMapper } from '../mappers/shop.mapper';
import { ShopFilters, ShopReportRequest, ShopViewModel, ShopCardViewModel, ShopPerformanceViewModel } from '../types/view.types';
import { 
  ShopApiDto, 
  ShopCardApiDto, 
  BestShopApiDto,
  ShopPerformanceApiDto,
  ShopReportSubjectApiDto 
} from '../types/dto.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class ShopService {
  private readonly httpClient = getHttpClient();

  async getShop(shopId: string): Promise<ShopViewModel> {
    try {
      const response = await this.httpClient.get<ShopApiDto>(
        SHOP_ENDPOINTS.GET_SHOP,
        { params: { Id: shopId } }
      );

      const domain = ShopMapper.toDomain(response.data);
      return ShopMapper.toView(domain);
    } catch (error) {
      logger.error('[ShopService] Get shop failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getShopPage(shopId: string): Promise<any> {
    try {
      const response = await this.httpClient.get<any>(
        SHOP_ENDPOINTS.GET_SHOP_PAGE,
        { params: { ShopId: shopId } }
      );
      return response.data;
    } catch (error) {
      logger.error('[ShopService] Get shop page failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getBestShops(): Promise<ShopCardViewModel[]> {
    try {
      const response = await this.httpClient.get<BestShopApiDto[]>(
        SHOP_ENDPOINTS.GET_BEST_SHOPS
      );

      return response.data.map(dto => ({
        id: dto.id,
        name: (dto as any).shopTitle || dto.name,
        logo: dto.logo,
        rating: (dto as any).averageRate || dto.rating || 0,
        reviewCount: dto.reviewCount || 0,
        productCount: dto.productCount || 0,
        isVerified: true, 
        cityName: '', 
        rank: (dto as any).ranking || dto.rank || 0,
      })).map(dto => ShopMapper.toViewCard(dto as unknown as ShopCardApiDto));
    } catch (error) {
      logger.error('[ShopService] Get best shops failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getShopCards(filters: ShopFilters): Promise<PaginatedResult<ShopCardViewModel>> {
    try {
      const params: Record<string, unknown> = {
        OrderBy: filters.orderBy || 'Rating',
        PageNumber: filters.pageNumber || 1,
        PageSize: filters.pageSize || 30,
      };

      if (filters.carManufacturerIds?.length) {
        params.CarManufacturerIds = filters.carManufacturerIds;
      }
      if (filters.carIds?.length) {
        params.CarIds = filters.carIds;
      }
      if (filters.partIds?.length) {
        params.PartIds = filters.partIds;
      }

      const response = await this.httpClient.get<any>(SHOP_ENDPOINTS.GET_SHOP_CARDS, { params });

      const rawItems = response.data.items || [];
      const currentPage = response.data.currentPage || response.data.pageNumber || 1;
      const pageSize = response.data.pageSize || 30;
      const totalCount = response.data.totalCount || rawItems.length;
      const totalPages = response.data.totalPages || Math.ceil(totalCount / pageSize) || 1;

      // مپ دقیق فیلدهای دریافتی Swagger به مدل ویو کارت
      const items: ShopCardViewModel[] = rawItems.map((dto: any) => ({
        id: dto.id,
        name: dto.shopTitle || dto.name || 'فروشگاه یدکچی',
        logo: dto.logo || null,
        rating: dto.averageRate ?? dto.rating ?? 0,
        reviewCount: dto.reviewCount || 0,
        productCount: dto.productCount || dto.shopProductCount || 0,
        isVerified: true,
        cityName: dto.cityName || '',
        rank: dto.ranking ?? dto.rank ?? 0,
        highestDiscount: dto.highestDiscount || 0,
      }));

      return {
        items,
        pageNumber: currentPage,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        hasMore: currentPage < totalPages,
        from: (currentPage - 1) * pageSize + 1,
        to: Math.min(currentPage * pageSize, totalCount),
      };
    } catch (error) {
      logger.error('[ShopService] Get shop cards failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getReportSubjects(reportType: string = 'ShopProductReport'): Promise<ShopReportSubjectApiDto[]> {
    try {
      const response = await this.httpClient.get<ShopReportSubjectApiDto[]>(
        SHOP_ENDPOINTS.GET_REPORT_SUBJECTS,
        { params: { ReportType: reportType } }
      );
      return response.data;
    } catch (error) {
      logger.error('[ShopService] Get report subjects failed:', error);
      return [];
    }
  }

  async submitShopReport(report: ShopReportRequest): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('ShopId', report.shopId);
      if (report.shopProductId) {
        formData.append('ShopProductId', report.shopProductId);
      }
      formData.append('Description', report.description);
      formData.append('ReportSubjectId', report.reportSubjectId);

      await this.httpClient.post(SHOP_ENDPOINTS.POST_SHOP_REPORT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      logger.error('[ShopService] Submit shop report failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getShopPerformance(): Promise<ShopPerformanceViewModel> {
    try {
      const response = await this.httpClient.get<ShopPerformanceApiDto>(
        SHOP_ENDPOINTS.GET_SHOP_PERFORMANCE
      );
      return ShopMapper.toViewPerformance(response.data);
    } catch (error) {
      logger.error('[ShopService] Get shop performance failed:', error);
      throw errorManager.normalize(error);
    }
  }
}

let shopServiceInstance: ShopService | null = null;

export function getShopService(): ShopService {
  if (!shopServiceInstance) {
    shopServiceInstance = new ShopService();
  }
  return shopServiceInstance;
}