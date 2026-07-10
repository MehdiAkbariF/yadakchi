// src/domains/front/reference/city/types/dto.types.ts

export interface CityApiDto {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProvinceCityApiDto {
  id: string;
  name: string;
}

export interface CityListRequestDto {
  ids?: string[];
  name?: string;
  exactName?: string;
  provinceName?: string;
  exactProvinceName?: string;
  provinceId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// src/domains/front/reference/province/types/dto.types.ts

export interface ProvinceApiDto {
  id: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProvinceListRequestDto {
  name?: string;
  ids?: string[];
  isActive?: boolean;
  isDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// src/domains/front/reference/country/types/dto.types.ts

export interface CountryApiDto {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
}