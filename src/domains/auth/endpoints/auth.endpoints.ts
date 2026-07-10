// src/domains/auth/endpoints/auth.endpoints.ts

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/Login/Authentication',
  CONFIRM_LOGIN: '/api/Login/ConfirmAuthentication',
  LOGOUT: '/api/Login/Logout',
  REFRESH_TOKEN: '/api/Login/Refresh',
  GET_USER: '/api/UserPanel/User',
} as const;

export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];