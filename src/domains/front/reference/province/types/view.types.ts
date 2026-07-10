// src/domains/front/reference/province/types/view.types.ts

export interface ProvinceViewModel {
  id: string;
  name: string;
  cities: any[];
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