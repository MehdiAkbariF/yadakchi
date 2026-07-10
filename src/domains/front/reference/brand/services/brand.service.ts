// src/domains/front/reference/brand/services/brand.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { BRAND_ENDPOINTS } from '../endpoints/brand.endpoints';
import { BrandMapper } from '../mappers/brand.mapper';
import { BrandFilters, BrandNameFilters } from '../types/view.types';
import { BrandApiDto, BrandNameApiDto } from '../types/dto.types';
import { BrandViewModel, BrandNameViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class BrandService {
  private readonly httpClient = getHttpClient();

  async getBrands(filters: BrandFilters): Promise<PaginatedResult<BrandViewModel>> {
    try {
      const dto = BrandMapper.toDomainRequest(filters);
      
      const response = await this.httpClient.get<{
        items: BrandApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(BRAND_ENDPOINTS.GET_BRANDS, { params: dto as Record<string, unknown> });

      const items = response.data.items.map(dto => BrandMapper.toView(dto));

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
      logger.error('[BrandService] Get brands failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getBrandsName(filters: BrandNameFilters): Promise<BrandNameViewModel[]> {
    try {
      const dto = BrandMapper.toDomainNameRequest(filters);
      
      const response = await this.httpClient.get<BrandNameApiDto[]>(
        BRAND_ENDPOINTS.GET_BRANDS_NAME,
        { params: dto as Record<string, unknown> }
      );

      return response.data.map(dto => BrandMapper.toViewName(dto));
    } catch (error) {
      logger.error('[BrandService] Get brands name failed:', error);
      return [];
    }
  }

  async getMainBrands(): Promise<BrandViewModel[]> {
    try {
      const response = await this.httpClient.get<BrandApiDto[]>(
        BRAND_ENDPOINTS.GET_MAIN_BRANDS
      );

      return response.data.map(dto => BrandMapper.toView(dto));
    } catch (error) {
      logger.error('[BrandService] Get main brands failed:', error);
      return [];
    }
  }
}

let brandServiceInstance: BrandService | null = null;

export function getBrandService(): BrandService {
  if (!brandServiceInstance) {
    brandServiceInstance = new BrandService();
  }
  return brandServiceInstance;
}