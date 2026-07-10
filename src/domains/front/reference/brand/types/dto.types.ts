// src/domains/front/reference/brand/types/dto.types.ts

export interface BrandApiDto {
  id: string;
  name: string;
  englishTitle: string;
  logo?: string;
  partIds: string[];
  carModel?: string;
  partCategoryId?: string;
  carIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandNameApiDto {
  id: string;
  name: string;
  englishTitle: string;
}

export interface BrandListRequestDto {
  name?: string;
  englishTitle?: string;
  partIds?: string[];
  carModel?: string;
  partCategoryId?: string;
  carIds?: string[];
  pageNumber?: number;
  pageSize?: number;
}

export interface BrandNameRequestDto {
  searchTerm?: string;
  partCategoryEnglishTitle?: string;
  partEnglishTitle?: string;
  carModel?: string;
}