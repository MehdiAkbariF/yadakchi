export interface Car {
  id: string;
  model: string;
  englishTitle: string;
  manufacturer: CarManufacturer;
  country?: Country;
  year?: number;
  metadata: CarMetadata;
  isActive: boolean;
  description?: string;
  cover?: string | null;
  coverAlt?: string | null;
  breadCrumbs?: Array<{ id: string; title: string; englishTitle: string }>;
}

export interface CarManufacturer {
  id: string;
  name: string;
  englishTitle: string;
  country?: Country;
  logo?: string;
}

export interface Country {
  id: string;
  name: string;
  abbreviation: string;
}

export interface CarMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export interface CarName {
  id: string;
  model: string;
  englishTitle: string;
  manufacturerName: string;
}