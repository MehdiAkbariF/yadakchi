// src/domains/front/part/types/domain.types.ts

export interface Part {
  id: string;
  name: PartName;
  description: string;
  category: PartCategory;
  brand: PartBrand;
  carModel: string;
  carIds: string[];
  properties: PartProperty[];
  metadata: PartMetadata;
  isActive: boolean;
}

export interface PartName {
  value: string;
  english: string;
}

export interface PartCategory {
  id: string;
  name: string;
  englishTitle: string;
  description: string;
  parentId?: string;
  children?: PartCategory[];
  hasSeo: boolean;
  hasDescription: boolean;
}

export interface PartBrand {
  id: string;
  name: string;
  englishTitle?: string;
}

export interface PartProperty {
  id: string;
  key: string;
  value: string;
  displayOrder: number;
}

export interface PartMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export interface PartCategoryPage {
  category: PartCategory;
  parts: Part[];
}