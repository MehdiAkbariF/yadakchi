// src/domains/front/reference/country/hooks/country.hooks.ts

import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getCountryService } from '../services/country.service';
import { CountryFilters } from '../types/view.types';


const countryService = getCountryService();

export function useGetCountries(filters: CountryFilters = {}) {
  return useTypedQuery(
    ['reference', 'countries', 'list', filters],
    () => countryService.getCountries(filters),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}