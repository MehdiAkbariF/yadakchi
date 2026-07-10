// src/domains/front/reference/country/services/country.service.ts

import { getHttpClient } from '@/core/http/client';

import { logger } from '@/core/utils/logger';
import { COUNTRY_ENDPOINTS } from '../endpoints/country.endpoints';
import { CountryApiDto } from '../types/dto.types';
import { CountryViewModel, CountryFilters } from '../types/view.types';

export class CountryService {
  private readonly httpClient = getHttpClient();

  async getCountries(filters: CountryFilters = {}): Promise<CountryViewModel[]> {
    try {
      const params: Record<string, unknown> = {
        Id: filters.id,
        Name: filters.name,
        Abbreviation: filters.abbreviation,
      };

      const response = await this.httpClient.get<CountryApiDto[]>(
        COUNTRY_ENDPOINTS.GET_COUNTRIES,
        { params }
      );

      return response.data.map(dto => ({
        id: dto.id,
        name: dto.name,
        abbreviation: dto.abbreviation,
      }));
    } catch (error) {
      logger.error('[CountryService] Get countries failed:', error);
      return [];
    }
  }
}

let countryServiceInstance: CountryService | null = null;

export function getCountryService(): CountryService {
  if (!countryServiceInstance) {
    countryServiceInstance = new CountryService();
  }
  return countryServiceInstance;
}