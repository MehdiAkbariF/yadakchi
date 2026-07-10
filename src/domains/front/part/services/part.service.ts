// src/domains/front/part/services/part.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { PART_ENDPOINTS } from '../endpoints/part.endpoints';
import { PartMapper } from '../mappers/part.mapper';
import { PartFilters, PartCategoryFilters } from '../types/view.types';
import { 
  PartApiDto, 
  PartPropertiesApiDto,
  PartCategoryApiDto,
  PartCategoryPageApiDto,
  PartNameApiDto
} from '../types/dto.types';
import { 
  PartViewModel, 
  PartCategoryViewModel, 
  PartCategoryPageViewModel,
  PartNameViewModel
} from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class PartService {
  private readonly httpClient = getHttpClient();

  async getPartList(filters: PartFilters): Promise<PaginatedResult<PartViewModel>> {
    try {
      const dto = PartMapper.toDomainRequest(filters);
      
      const response = await this.httpClient.get<{
        items: PartApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }>(PART_ENDPOINTS.GET_PART_LIST, { params: dto as Record<string, unknown> });

      const items = response.data.items.map(async (item) => {
        const domain = PartMapper.toDomain(item);
        const properties = await this.getPartProperties(item.id);
        return PartMapper.toView(domain, properties);
      });

      return {
        items: await Promise.all(items),
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
      logger.error('[PartService] Get part list failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getPartPage(partEnglishName: string, carModel?: string): Promise<PartViewModel> {
    try {
      const response = await this.httpClient.get<PartApiDto>(
        PART_ENDPOINTS.GET_PART_PAGE,
        { 
          params: { 
            PartEnglishName: partEnglishName,
            CarModel: carModel || ''
          } 
        }
      );

      const domain = PartMapper.toDomain(response.data);
      const properties = await this.getPartProperties(domain.id);
      return PartMapper.toView(domain, properties);
    } catch (error) {
      logger.error('[PartService] Get part page failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getPartProperties(partId: string): Promise<PartPropertiesApiDto[]> {
    try {
      const response = await this.httpClient.get<PartPropertiesApiDto[]>(
        PART_ENDPOINTS.GET_PART_PROPERTIES,
        { params: { Id: partId } }
      );
      return response.data;
    } catch (error) {
      logger.error('[PartService] Get part properties failed:', error);
      return [];
    }
  }

  async getPartsName(filters: PartFilters): Promise<PartNameViewModel[]> {
    try {
      const params: Record<string, unknown> = {
        Name: filters.name,
        BrandIds: [],
        CarModel: filters.carModel,
        PartCategoryId: filters.partCategoryId,
        PartCategoryEnglishTitle: filters.partCategoryEnglishTitle,
        CarIds: [],
        PageNumber: filters.pageNumber || 1,
        PageSize: filters.pageSize || 30,
      };

      const response = await this.httpClient.get<{
        items: PartNameApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
      }>(PART_ENDPOINTS.GET_PARTS_NAME, { params });

      return response.data.items.map(dto => PartMapper.toViewName(dto));
    } catch (error) {
      logger.error('[PartService] Get parts name failed:', error);
      return [];
    }
  }

  async getPartCategories(carId?: string): Promise<PartCategoryViewModel[]> {
    try {
      const response = await this.httpClient.get<PartCategoryApiDto[]>(
        PART_ENDPOINTS.GET_PART_CATEGORIES,
        { params: { CarId: carId || '' } }
      );

      const viewCategories = response.data.map(dto => PartMapper.toViewCategory(dto));
      return PartMapper.formatCategoryTree(viewCategories);
    } catch (error) {
      logger.error('[PartService] Get part categories failed:', error);
      return [];
    }
  }

  async getPartCategoryPage(englishTitle: string): Promise<PartCategoryPageViewModel> {
    try {
      const response = await this.httpClient.get<PartCategoryPageApiDto>(
        PART_ENDPOINTS.GET_PART_CATEGORY_PAGE,
        { params: { PartCategoryEnglishTitle: englishTitle } }
      );

      return PartMapper.toViewCategoryPage(response.data);
    } catch (error) {
      logger.error('[PartService] Get part category page failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getPartCategoriesName(filters: PartCategoryFilters): Promise<PartCategoryViewModel[]> {
    try {
      const params: Record<string, unknown> = {
        Name: filters.name,
        EnglishTitle: filters.englishTitle,
        Id: filters.id || '',
        Description: filters.description || '',
        HasSeo: filters.hasSeo,
        HasDescription: filters.hasDescription,
        PartCategoryId: filters.partCategoryId || '',
        IsActive: filters.isActive,
        IsDeleted: filters.isDeleted,
        PageNumber: filters.pageNumber || 1,
        PageSize: filters.pageSize || 30,
      };

      const response = await this.httpClient.get<{
        items: PartCategoryApiDto[];
        pageNumber: number;
        pageSize: number;
        totalCount: number;
      }>(PART_ENDPOINTS.GET_PART_CATEGORIES_NAME, { params });

      return response.data.items.map(dto => PartMapper.toViewCategory(dto));
    } catch (error) {
      logger.error('[PartService] Get part categories name failed:', error);
      return [];
    }
  }
}

let partServiceInstance: PartService | null = null;

export function getPartService(): PartService {
  if (!partServiceInstance) {
    partServiceInstance = new PartService();
  }
  return partServiceInstance;
}