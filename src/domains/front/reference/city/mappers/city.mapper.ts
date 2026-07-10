// src/domains/front/reference/city/mappers/city.mapper.ts

import { CityApiDto, ProvinceCityApiDto, CityListRequestDto } from '../types/dto.types';
import { CityViewModel, ProvinceCityViewModel, CityFilters } from '../types/view.types';

export class CityMapper {
  static toView(dto: CityApiDto): CityViewModel {
    return {
      id: dto.id,
      name: dto.name,
      province: {
        id: dto.provinceId,
        name: dto.provinceName,
      },
      displayName: `${dto.provinceName} - ${dto.name}`,
      isActive: dto.isActive,
    };
  }

  static toViewProvinceCity(dto: ProvinceCityApiDto): ProvinceCityViewModel {
    return {
      id: dto.id,
      name: dto.name,
    };
  }

  static toDomainRequest(request: CityFilters): CityListRequestDto {
    return {
      ids: request.ids,
      name: request.name,
      exactName: request.exactName,
      provinceName: request.provinceName,
      exactProvinceName: request.exactProvinceName,
      provinceId: request.provinceId,
      isActive: request.isActive,
      isDeleted: request.isDeleted,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 30,
    };
  }
}