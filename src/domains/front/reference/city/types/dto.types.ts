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

// ساختار کامل درخت‌واره استان‌ها و شهرهای مربوطه مطابق ساختار واقعی API شما
export interface ProvinceCitiesTreeApiDto {
  id: string;
  name: string;
  cities: Array<{
    id: string;
    name: string;
  }>;
}