// src/domains/front/reference/country/types/view.types.ts

export interface CountryViewModel {
  id: string;
  name: string;
  abbreviation: string;
}

export interface CountryFilters {
  id?: string;
  name?: string;
  abbreviation?: string;
}