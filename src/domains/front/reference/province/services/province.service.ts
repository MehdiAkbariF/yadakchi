// src/domains/front/reference/province/services/province.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { PROVINCE_ENDPOINTS } from '../endpoints/province.endpoints';
import { ProvinceApiDto } from '../types/dto.types';
import { ProvinceViewModel, ProvinceFilters } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class ProvinceService {
  private readonly httpClient = getHttpClient();

  async getProvinces(filters: ProvinceFilters): Promise<PaginatedResult<ProvinceViewModel>> {
    try {
      const params: Record<string, unknown> = {
        Name: filters.name,
        Ids: filters.ids,
        IsActive: filters.isActive,
        IsDeleted: filters.isDeleted,
        PageNumber: filters.pageNumber || 1,
        PageSize: filters.pageSize || 30,
      };

      const response = await this.httpClient.get<{
        items: ProvinceApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(PROVINCE_ENDPOINTS.GET_PROVINCES, { params });

      const items = response.data.items.map(dto => ({
        id: dto.id,
        name: dto.name,
        cities: [],
        isActive: dto.isActive,
      }));

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
      logger.error('[ProvinceService] Get provinces failed:', error);
      throw errorManager.normalize(error);
    }
  }
}

let provinceServiceInstance: ProvinceService | null = null;

export function getProvinceService(): ProvinceService {
  if (!provinceServiceInstance) {
    provinceServiceInstance = new ProvinceService();
  }
  return provinceServiceInstance;
}