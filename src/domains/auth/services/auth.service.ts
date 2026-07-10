// src/domains/auth/services/auth.service.ts

import { getHttpClient } from '@/core/http/client';
import { ApiError } from '@/core/errors/api-error';
import { ErrorType } from '@/core/errors/types/error.types';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { AUTH_ENDPOINTS } from '../endpoints/auth.endpoints';
import { AuthMapper } from '../mappers/auth.mapper';
import { LoginRequest, ConfirmLoginRequest } from '../validation/auth.validation';
import { AuthResponseDto, ApiResponseDto } from '../types/dto.types';
import { User } from '../types/auth.types';

export class AuthService {
  private readonly httpClient = getHttpClient();

  /**
   * درخواست کد تایید برای شماره موبایل
   */
  async requestLogin(credentials: LoginRequest): Promise<void> {
    try {
      logger.debug('[Auth] Requesting login for:', credentials.phoneNumber);
      
      await this.httpClient.post<ApiResponseDto<null>>(
        AUTH_ENDPOINTS.LOGIN,
        {
          phoneNumber: credentials.phoneNumber,
        }
      );
    } catch (error) {
      logger.error('[Auth] Login request failed:', error);
      throw errorManager.normalize(error);
    }
  }

  /**
   * تایید کد و ورود به سیستم
   */
  async confirmLogin(credentials: ConfirmLoginRequest): Promise<User> {
    try {
      logger.debug('[Auth] Confirming login for:', credentials.phoneNumber);
      
      const response = await this.httpClient.post<ApiResponseDto<AuthResponseDto>>(
        AUTH_ENDPOINTS.CONFIRM_LOGIN,
        {
          phoneNumber: credentials.phoneNumber,
          code: credentials.code,
        }
      );

      if (!response.data.data) {
        throw new ApiError({
          type: ErrorType.UNKNOWN,
          message: 'No user data received',
          userMessage: 'خطا در دریافت اطلاعات کاربر',
        });
      }

      const user = AuthMapper.toDomain(response.data.data);
      logger.info('[Auth] User logged in successfully:', user.id);
      
      return user;
    } catch (error) {
      logger.error('[Auth] Confirm login failed:', error);
      throw errorManager.normalize(error);
    }
  }

  /**
   * خروج از سیستم
   */
  async logout(): Promise<void> {
    try {
      logger.debug('[Auth] Logging out');
      
      await this.httpClient.post(AUTH_ENDPOINTS.LOGOUT);
      
      logger.info('[Auth] User logged out successfully');
    } catch (error) {
      logger.error('[Auth] Logout failed:', error);
      throw errorManager.normalize(error);
    }
  }

  /**
   * دریافت اطلاعات کاربر فعلی
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      logger.debug('[Auth] Getting current user');
      
      const response = await this.httpClient.get<ApiResponseDto<AuthResponseDto>>(
        AUTH_ENDPOINTS.GET_USER
      );

      if (!response.data.data) {
        return null;
      }

      return AuthMapper.toDomain(response.data.data);
    } catch (error) {
      // اگر کاربر لاگین نباشد، خطا را نادیده بگیرید
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }
      logger.error('[Auth] Get current user failed:', error);
      throw errorManager.normalize(error);
    }
  }

  /**
   * بررسی احراز هویت کاربر
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}