export interface CarViewModel {
  id: string;
  model: string;
  englishTitle: string;
  manufacturer: {
    id: string;
    name: string;
    englishTitle: string;
  };
  country: {
    id: string;
    name: string;
  } | null;
  year: number | null;
  displayName: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
  description: string | null;
  cover: string | null;
  coverAlt: string | null;
  breadCrumbs: Array<{ id: string; title: string; englishTitle: string }>;
}

export interface CarManufacturerViewModel {
  id: string;
  name: string;
  englishTitle: string;
  country: string | null;
  logo: string | null;
}

export interface CarNameViewModel {
  id: string;
  model: string;
  englishTitle: string;
  manufacturerName: string;
  displayName: string;
}

export interface CarFilters {
  model?: string;
  englishTitle?: string;
  carManufacturerId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CarNameFilters {
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

export interface CarManufacturerFilters {
  ids?: string[];
  name?: string;
  englishTitle?: string;
  countryId?: string;
}