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