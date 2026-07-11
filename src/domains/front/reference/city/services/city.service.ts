// src/domains/front/reference/city/services/city.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { CITY_ENDPOINTS } from '../endpoints/city.endpoints';
import { CityMapper } from '../mappers/city.mapper';
import { CityFilters } from '../types/view.types';
import { CityApiDto, ProvinceCityApiDto, ProvinceCitiesTreeApiDto } from '../types/dto.types';
import { CityViewModel, ProvinceCityViewModel, ProvinceCitiesTreeViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class CityService {
  private readonly httpClient = getHttpClient();

  async getCities(filters: CityFilters): Promise<PaginatedResult<CityViewModel>> {
    try {
      const dto = CityMapper.toDomainRequest(filters);
      
      const response = await this.httpClient.get<{
        items: CityApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(CITY_ENDPOINTS.GET_CITIES, { params: dto as Record<string, unknown> });

      const items = response.data.items.map(dto => CityMapper.toView(dto));

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
      logger.error('[CityService] Get cities failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getProvinceCities(provinceId: string, cityName?: string): Promise<ProvinceCityViewModel[]> {
    try {
      const params: Record<string, unknown> = {
        ProvinceId: provinceId,
        CityName: cityName || '',
      };

      const response = await this.httpClient.get<ProvinceCityApiDto[]>(
        CITY_ENDPOINTS.GET_PROVINCE_CITIES,
        { params }
      );

      return response.data.map(dto => CityMapper.toViewProvinceCity(dto));
    } catch (error) {
      logger.error('[CityService] Get province cities failed:', error);
      return [];
    }
  }

  // متد جدید دریافت ساختار درختی کامل استان‌ها و شهرها بدون پارامتر ورودی
  async getProvinceCitiesTree(): Promise<ProvinceCitiesTreeViewModel[]> {
    try {
      const response = await this.httpClient.get<ProvinceCitiesTreeApiDto[]>(
        CITY_ENDPOINTS.GET_PROVINCE_CITIES
      );
      
      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.map(province => ({
        id: province.id,
        name: province.name,
        cities: (province.cities || []).map(city => ({
          id: city.id,
          name: city.name,
        })),
      }));
    } catch (error) {
      logger.error('[CityService] Get province cities tree failed:', error);
      return [];
    }
  }
}

let cityServiceInstance: CityService | null = null;

export function getCityService(): CityService {
  if (!cityServiceInstance) {
    cityServiceInstance = new CityService();
  }
  return cityServiceInstance;
}