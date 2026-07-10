// src/index.ts

// Core
export * from './core/config';
export * from './core/http';
export * from './core/errors';
export * from './core/utils';
export * from './core/validation';

// Lib - React Query
export { queryClient, queryKeys } from './lib/react-query/query-client';

// Domains - Auth
export * from './domains/auth';

// Domains - Front Product
export * from './domains/front/product';

// Domains - Front Shop (اجتناب از تداخل با Product)
export {
  ShopService,
  getShopService,
  ShopMapper,
  SHOP_ENDPOINTS,
  shopValidators,
  useGetShop,
  useGetShopPage,
  useGetBestShops,
  useGetShopCards,
  useGetShopPerformance,
  useGetReportSubjects,
  useSubmitShopReport,
} from './domains/front/shop';

// Domains - Front Basket
export * from './domains/front/basket';

// Domains - Comment
export * from './domains/front/comment';

// Domains - Inquiry
export * from './domains/front/inquiry';

// Domains - Part
export * from './domains/front/part';

// Domains - Banner
export * from './domains/front/banner';

// Domains - Static
export * from './domains/front/static';

// Domains - Reference (Car)
export * from './domains/front/reference/car';

// Domains - Reference (Brand)
export * from './domains/front/reference/brand';

// Domains - Reference (City) - فقط City
export {
  CityService,
  getCityService,
  CityMapper,
  CITY_ENDPOINTS,
  CITY_CONSTANTS,
  useGetCities,
  useGetProvinceCities,
} from './domains/front/reference/city';

// Domains - Reference (Province) - فقط Province
export {
  ProvinceService,
  getProvinceService,
  PROVINCE_ENDPOINTS,
  PROVINCE_CONSTANTS,
  useGetProvinces,
} from './domains/front/reference/province';

// Domains - Reference (Country) - فقط Country
export {
  CountryService,
  getCountryService,
  COUNTRY_ENDPOINTS,
  COUNTRY_CONSTANTS,
  useGetCountries,
} from './domains/front/reference/country';

// Shared Types
export * from './shared/types/common.types';

// Providers
export { RootProvider } from './providers/root.provider';
export { QueryProvider } from './providers/query.provider';