// src/domains/auth/types/dto.types.ts

/**
 * API DTOs - مطابق با مستندات Swagger
 */

export interface LoginRequestDto {
  phoneNumber: string;
}

export interface ConfirmLoginRequestDto {
  phoneNumber: string;
  code: string;
}

export interface LogoutRequestDto {
  // No body needed - uses cookies
}

export interface AuthResponseDto {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  nationalCode?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface ApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}