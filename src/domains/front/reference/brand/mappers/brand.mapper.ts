// src/domains/front/reference/brand/mappers/brand.mapper.ts

import { BrandApiDto, BrandNameApiDto, BrandListRequestDto, BrandNameRequestDto } from '../types/dto.types';
import { BrandViewModel, BrandNameViewModel, BrandFilters, BrandNameFilters } from '../types/view.types';

export class BrandMapper {
  static toView(dto: BrandApiDto): BrandViewModel {
    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      logo: dto.logo || null,
      partCount: dto.partIds?.length || 0,
      carModel: dto.carModel || null,
      metadata: {
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
      },
    };
  }

  static toViewName(dto: BrandNameApiDto): BrandNameViewModel {
    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      displayName: dto.name,
    };
  }

  static toDomainRequest(request: BrandFilters): BrandListRequestDto {
    return {
      name: request.name,
      englishTitle: request.englishTitle,
      partIds: request.partIds,
      carModel: request.carModel,
      partCategoryId: request.partCategoryId,
      carIds: request.carIds,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 30,
    };
  }

  static toDomainNameRequest(request: BrandNameFilters): BrandNameRequestDto {
    return {
      searchTerm: request.searchTerm,
      partCategoryEnglishTitle: request.partCategoryEnglishTitle,
      partEnglishTitle: request.partEnglishTitle,
      carModel: request.carModel,
    };
  }
}