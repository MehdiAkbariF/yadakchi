export interface CarApiDto {
  id: string;
  model: string;
  englishTitle: string;
  carManufacturerId: string;
  carManufacturerName: string;
  countryId?: string;
  countryName?: string;
  year?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  cover?: string | null;
  coverAlt?: string | null;
  breadCrumbs?: Array<{ id: string; title: string; englishTitle: string }>;
}

export interface CarManufacturerApiDto {
  id: string;
  name: string;
  englishTitle: string;
  countryId?: string;
  countryName?: string;
  logo?: string;
  isActive: boolean;
}

export interface CarNameApiDto {
  id: string;
  model: string;
  englishTitle: string;
  carManufacturerId: string;
  carManufacturerName: string;
}

export interface CarListRequestDto {
  model?: string;
  englishTitle?: string;
  carManufacturerId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CarNameRequestDto {
  ids?: string[];
  model?: string;
  englishTitle?: string;
  carManufacturerId?: string;
  brandIds?: string[];
  partIds?: string[];
  partCategoryEnglishTitle?: string;
  partEnglishTitle?: string;
  pageNumber?: number;
  pageSize?: number;
}