import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { CAR_ENDPOINTS } from '../endpoints/car.endpoints';
import { CarMapper } from '../mappers/car.mapper';
import { CarApiDto, CarManufacturerApiDto, CarNameApiDto } from '../types/dto.types';
import { CarViewModel, CarManufacturerViewModel, CarNameViewModel, CarFilters, CarNameFilters, CarManufacturerFilters } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class CarService {
  private readonly httpClient = getHttpClient();

  async getCarListFlat(pageNumber: number = 1, pageSize: number = 200): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        CAR_ENDPOINTS.GET_CAR_LIST,
        { params: { PageNumber: pageNumber, PageSize: pageSize } }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('[CarService] Get flat car list failed:', error);
      throw errorManager.normalize(error);
    }
  }

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

  async getCarsName(filters: CarNameFilters): Promise<CarNameViewModel[]> {
    try {
      const params: Record<string, unknown> = {
        Ids: filters.ids,
        Model: filters.model,
        EnglishTitle: filters.englishTitle,
        CarManufacturerId: filters.carManufacturerId,
        BrandIds: filters.brandIds,
        PartIds: filters.partIds,
        PartCategoryEnglishTitle: filters.partCategoryEnglishTitle,
        PartEnglishTitle: filters.partEnglishTitle,
      };

      const response = await this.httpClient.get<CarNameApiDto[]>(
        CAR_ENDPOINTS.GET_CARS_NAME,
        { params }
      );

      return response.data.map(dto => CarMapper.toViewName(dto));
    } catch (error) {
      logger.error('[CarService] Get cars name failed:', error);
      return [];
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

      return response.data.map(dto => CarManufacturerMapper.toViewManufacturer(dto));
    } catch (error) {
      logger.error('[CarService] Get car manufacturers failed:', error);
      return [];
    }
  }
}

const CarManufacturerMapper = {
  toViewManufacturer(dto: any): CarManufacturerViewModel {
    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      country: dto.countryName || null,
      logo: dto.icon || dto.logo || null,
    };
  }
};

let carServiceInstance: CarService | null = null;

export function getCarService(): CarService {
  if (!carServiceInstance) {
    carServiceInstance = new CarService();
  }
  return carServiceInstance;
}