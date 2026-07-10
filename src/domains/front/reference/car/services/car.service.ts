// src/domains/front/reference/car/services/car.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { CAR_ENDPOINTS } from '../endpoints/car.endpoints';
import { CarMapper } from '../mappers/car.mapper';
import { CarFilters, CarNameFilters, CarManufacturerFilters } from '../types/view.types';
import { CarApiDto, CarManufacturerApiDto, CarNameApiDto } from '../types/dto.types';
import { CarViewModel, CarManufacturerViewModel, CarNameViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class CarService {
  private readonly httpClient = getHttpClient();

  async getCarList(filters: CarFilters): Promise<PaginatedResult<CarViewModel>> {
    try {
      const dto = CarMapper.toDomainRequest(filters);
      
      const response = await this.httpClient.get<{
        items: CarApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(CAR_ENDPOINTS.GET_CAR_LIST, { params: dto as Record<string, unknown> });

      const items = response.data.items.map(dto => {
        const domain = CarMapper.toDomain(dto);
        return CarMapper.toView(domain);
      });

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
      logger.error('[CarService] Get car list failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getCarsName(filters: CarNameFilters): Promise<PaginatedResult<CarNameViewModel>> {
    try {
      const dto = CarMapper.toDomainNameRequest(filters);
      
      const response = await this.httpClient.get<{
        items: CarNameApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(CAR_ENDPOINTS.GET_CARS_NAME, { params: dto as Record<string, unknown> });

      const items = response.data.items.map(dto => CarMapper.toViewName(dto));

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
      logger.error('[CarService] Get cars name failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getCarPage(carModel: string): Promise<CarViewModel> {
    try {
      const response = await this.httpClient.get<CarApiDto>(
        CAR_ENDPOINTS.GET_CAR_PAGE,
        { params: { CarModel: carModel } }
      );

      const domain = CarMapper.toDomain(response.data);
      return CarMapper.toView(domain);
    } catch (error) {
      logger.error('[CarService] Get car page failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getCarManufacturers(filters: CarManufacturerFilters): Promise<CarManufacturerViewModel[]> {
    try {
      const params: Record<string, unknown> = {
        Ids: filters.ids,
        Name: filters.name,
        EnglishTitle: filters.englishTitle,
        CountryId: filters.countryId,
      };

      const response = await this.httpClient.get<CarManufacturerApiDto[]>(
        CAR_ENDPOINTS.GET_CAR_MANUFACTURERS,
        { params }
      );

      return response.data.map(dto => CarMapper.toViewManufacturer(dto));
    } catch (error) {
      logger.error('[CarService] Get car manufacturers failed:', error);
      return [];
    }
  }
}

let carServiceInstance: CarService | null = null;

export function getCarService(): CarService {
  if (!carServiceInstance) {
    carServiceInstance = new CarService();
  }
  return carServiceInstance;
}