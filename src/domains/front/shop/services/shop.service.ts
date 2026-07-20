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

  async getShopPage(shopId: string): Promise<ShopViewModel> {
    try {
      const response = await this.httpClient.get<ShopApiDto>(
        SHOP_ENDPOINTS.GET_SHOP_PAGE,
        { params: { ShopId: shopId } }
      );

      const domain = ShopMapper.toDomain(response.data);
      return ShopMapper.toView(domain);
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
        name: dto.name,
        logo: dto.logo,
        rating: dto.rating,
        reviewCount: dto.reviewCount,
        productCount: dto.productCount,
        isVerified: false, 
        cityName: '', 
        rank: dto.rank,
      })).map(dto => ShopMapper.toViewCard(dto as ShopCardApiDto));
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

      const response = await this.httpClient.get<{
        items: ShopCardApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(SHOP_ENDPOINTS.GET_SHOP_CARDS, { params });

      const items = response.data.items.map(dto => ShopMapper.toViewCard(dto));

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
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