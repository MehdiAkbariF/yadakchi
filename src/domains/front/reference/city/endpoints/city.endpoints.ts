// src/domains/front/reference/city/endpoints/city.endpoints.ts

export const CITY_ENDPOINTS = {
  GET_CITIES: '/api/Front/City',
  GET_PROVINCE_CITIES: '/api/Front/ProvinceCities',
} as const;

// src/domains/front/reference/province/endpoints/province.endpoints.ts

export const PROVINCE_ENDPOINTS = {
  GET_PROVINCES: '/api/Front/Province',
} as const;

// src/domains/front/reference/country/endpoints/country.endpoints.ts

export const COUNTRY_ENDPOINTS = {
  GET_COUNTRIES: '/api/Front/Country',
} as const;