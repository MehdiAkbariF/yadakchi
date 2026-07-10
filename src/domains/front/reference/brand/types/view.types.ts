// src/domains/front/reference/brand/types/view.types.ts

export interface BrandViewModel {
  id: string;
  name: string;
  englishTitle: string;
  logo: string | null;
  partCount: number;
  carModel: string | null;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface BrandNameViewModel {
  id: string;
  name: string;
  englishTitle: string;
  displayName: string;
}

export interface BrandFilters {
  name?: string;
  englishTitle?: string;
  partIds?: string[];
  carModel?: string;
  partCategoryId?: string;
  carIds?: string[];
  pageNumber?: number;
  pageSize?: number;
}

export interface BrandNameFilters {
  searchTerm?: string;
  partCategoryEnglishTitle?: string;
  partEnglishTitle?: string;
  carModel?: string;
}