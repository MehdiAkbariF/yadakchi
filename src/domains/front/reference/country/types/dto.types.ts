// src/domains/front/reference/country/types/dto.types.ts

export interface CountryApiDto {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
}

export interface CountryListRequestDto {
  id?: string;
  name?: string;
  abbreviation?: string;
}