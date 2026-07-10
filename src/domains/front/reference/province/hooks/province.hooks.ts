// src/domains/front/reference/province/hooks/province.hooks.ts

import { useTypedQuery } from '@/lib/react-query/hooks/base.hooks';
import { getProvinceService } from '../services/province.service';
import { ProvinceFilters } from '../types/view.types';


const provinceService = getProvinceService();

export function useGetProvinces(filters: ProvinceFilters) {
  return useTypedQuery(
    ['reference', 'provinces', 'list', filters],
    () => provinceService.getProvinces(filters),
    {
      staleTime: 15 * 60 * 1000,
    }
  );
}