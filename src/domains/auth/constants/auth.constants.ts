// src/domains/auth/constants/auth.constants.ts

export const AUTH_CONSTANTS = {
  // Cookie names
  COOKIES: {
    SESSION: 'session',
    REFRESH: 'refresh_token',
  } as const,

  // OTP settings
  OTP: {
    LENGTH: 6,
    EXPIRY_SECONDS: 120, // 2 minutes
    RESEND_DELAY_SECONDS: 30,
  } as const,

  // Session settings
  SESSION: {
    MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  } as const,

  // Error messages
  ERRORS: {
    INVALID_PHONE: 'شماره موبایل نامعتبر است',
    INVALID_OTP: 'کد تایید نامعتبر است',
    OTP_EXPIRED: 'کد تایید منقضی شده است',
    SESSION_EXPIRED: 'نشست شما منقضی شده است',
    UNAUTHORIZED: 'شما دسترسی به این بخش را ندارید',
    NETWORK_ERROR: 'خطا در برقراری ارتباط با سرور',
  } as const,
} as const;