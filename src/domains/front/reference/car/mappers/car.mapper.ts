// src/domains/front/reference/car/mappers/car.mapper.ts

import { 
  CarApiDto, 
  CarManufacturerApiDto,
  CarNameApiDto,
  CarListRequestDto,
  CarNameRequestDto
} from '../types/dto.types';
import { 
  Car, 

} from '../types/domain.types';
import { 
  CarViewModel, 
  CarManufacturerViewModel,
  CarNameViewModel,
  CarFilters,
  CarNameFilters,

} from '../types/view.types';

export class CarMapper {
  static toDomain(dto: CarApiDto): Car {
    return {
      id: dto.id,
      model: dto.model,
      englishTitle: dto.englishTitle,
      manufacturer: {
        id: dto.carManufacturerId,
        name: dto.carManufacturerName,
        englishTitle: dto.carManufacturerName,
      },
      country: dto.countryId && dto.countryName ? {
        id: dto.countryId,
        name: dto.countryName,
        abbreviation: '',
      } : undefined,
      year: dto.year,
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
      isActive: dto.isActive,
    };
  }

  static toView(domain: Car): CarViewModel {
    return {
      id: domain.id,
      model: domain.model,
      englishTitle: domain.englishTitle,
      manufacturer: {
        id: domain.manufacturer.id,
        name: domain.manufacturer.name,
        englishTitle: domain.manufacturer.englishTitle,
      },
      country: domain.country ? {
        id: domain.country.id,
        name: domain.country.name,
      } : null,
      year: domain.year || null,
      displayName: `${domain.manufacturer.name} ${domain.model}`,
      metadata: {
        createdAt: domain.metadata.createdAt.toISOString(),
        updatedAt: domain.metadata.updatedAt.toISOString(),
      },
    };
  }

  static toViewManufacturer(dto: CarManufacturerApiDto): CarManufacturerViewModel {
    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      country: dto.countryName || null,
      logo: dto.logo || null,
    };
  }

  static toViewName(dto: CarNameApiDto): CarNameViewModel {
    return {
      id: dto.id,
      model: dto.model,
      englishTitle: dto.englishTitle,
      manufacturerName: dto.carManufacturerName,
      displayName: `${dto.carManufacturerName} ${dto.model}`,
    };
  }

  static toDomainRequest(request: CarFilters): CarListRequestDto {
    return {
      model: request.model,
      englishTitle: request.englishTitle,
      carManufacturerId: request.carManufacturerId,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 30,
    };
  }

  static toDomainNameRequest(request: CarNameFilters): CarNameRequestDto {
    return {
      ids: request.ids,
      model: request.model,
      englishTitle: request.englishTitle,
      carManufacturerId: request.carManufacturerId,
      brandIds: request.brandIds,
      partIds: request.partIds,
      partCategoryEnglishTitle: request.partCategoryEnglishTitle,
      partEnglishTitle: request.partEnglishTitle,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 30,
    };
  }
}