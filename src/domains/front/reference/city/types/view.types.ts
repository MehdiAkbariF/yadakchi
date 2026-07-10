// src/domains/front/reference/city/types/view.types.ts

export interface CityViewModel {
  id: string;
  name: string;
  province: {
    id: string;
    name: string;
  };
  displayName: string;
  isActive: boolean;
}

export interface ProvinceCityViewModel {
  id: string;
  name: string;
}

export interface CityFilters {
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

// src/domains/front/reference/province/types/view.types.ts

export interface ProvinceViewModel {
  id: string;
  name: string;
  cities: CityViewModel[];
  isActive: boolean;
}

export interface ProvinceFilters {
  name?: string;
  ids?: string[];
  isActive?: boolean;
  isDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// src/domains/front/reference/country/types/view.types.ts

export interface CountryViewModel {
  id: string;
  name: string;
  abbreviation: string;
}

export interface CountryFilters {
  id?: string;
  name?: string;
  abbreviation?: string;
}