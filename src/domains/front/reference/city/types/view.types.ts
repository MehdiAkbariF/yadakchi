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

// مدل ویو درخت‌واره استان‌ها و شهرها برای رندرینگ مگا لیست
export interface ProvinceCitiesTreeViewModel {
  id: string;
  name: string;
  cities: Array<{
    id: string;
    name: string;
  }>;
}