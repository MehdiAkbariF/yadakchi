// src/domains/front/part/types/dto.types.ts

export interface PartApiDto {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  partCategoryId: string;
  partCategoryName: string;
  partCategoryEnglishTitle: string;
  brandId: string;
  brandName: string;
  carModel: string;
  carIds: string[];
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartPropertiesApiDto {
  id: string;
  partId: string;
  propertyKey: string;
  propertyValue: string;
  displayOrder: number;
}

export interface PartCategoryApiDto {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  parentId?: string;
  hasSeo: boolean;
  hasDescription: boolean;
  isActive: boolean;
  isDeleted: boolean;
  children?: PartCategoryApiDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PartCategoryPageApiDto {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentId?: string;
  children: PartCategoryApiDto[];
  parts: PartApiDto[];
}

export interface PartNameApiDto {
  id: string;
  name: string;
  englishTitle: string;
  brandId: string;
  brandName: string;
  carModel: string;
}

export interface PartListRequestDto {
  id?: string;
  name?: string;
  englishTitle?: string;
  partCategoryEnglishTitle?: string;
  partCategoryId?: string;
  carModel?: string;
  pageNumber?: number;
  pageSize?: number;
}