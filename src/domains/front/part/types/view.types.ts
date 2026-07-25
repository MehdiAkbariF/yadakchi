export interface PartViewModel {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  category: {
    id: string;
    name: string;
    englishTitle: string;
  };
  brand: {
    id: string;
    name: string;
    englishTitle?: string;
  };
  carModel: string;
  carIds: string[];
  image: string | null;
  properties: Array<{
    key: string;
    value: string;
    displayOrder: number;
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
  isActive: boolean;
}

export interface PartCategoryViewModel {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  parentId: string | null;
  hasSeo: boolean;
  hasDescription: boolean;
  children: PartCategoryViewModel[];
  createdAt: string;
  updatedAt: string;
}

export interface PartCategoryPageViewModel {
  category: PartCategoryViewModel;
  parts: PartViewModel[];
  totalParts: number;
  breadCrumbs: Array<{ id: string; title: string; englishTitle: string }>;
}

export interface PartNameViewModel {
  id: string;
  name: string;
  englishTitle: string;
  brandName: string;
  carModel: string;
  displayName: string;
}

export interface PartFilters {
  id?: string;
  name?: string;
  englishTitle?: string;
  partCategoryEnglishTitle?: string;
  partCategoryId?: string;
  carModel?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PartCategoryFilters {
  name?: string;
  englishTitle?: string;
  id?: string;
  description?: string;
  hasSeo?: boolean;
  hasDescription?: boolean;
  partCategoryId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}