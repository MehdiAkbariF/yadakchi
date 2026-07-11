// src/domains/auth/services/auth.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { AUTH_ENDPOINTS } from '../endpoints/auth.endpoints';
import { AuthMapper } from '../mappers/auth.mapper';
import { LoginRequest, ConfirmLoginRequest } from '../validation/auth.validation';
import { User } from '../types/auth.types';

export class AuthService {
  private readonly httpClient = getHttpClient();

  /**
   * درخواست ارسال پیامک کد تایید (Authentication) همراه با هدر x-client
   */
  async requestLogin(credentials: LoginRequest): Promise<void> {
    try {
      logger.debug('[Auth] Requesting login code for:', credentials.phoneNumber);
      
      await this.httpClient.post(
        AUTH_ENDPOINTS.LOGIN,
        {
          pattern: 'VerificationSms',
          phoneNumber: credentials.phoneNumber,
        },
        {
          headers: {
            'X-Client-Type': 'web', // ارسال هدر الزامی
          }
        }
      );
    } catch (error) {
      logger.error('[Auth] Login request failed:', error);
      throw errorManager.normalize(error);
    }
  }

  /**
   * تایید کد ارسالی و ورود به سیستم (ConfirmAuthentication)
   */
  async confirmLogin(credentials: ConfirmLoginRequest): Promise<User> {
    try {
      logger.debug('[Auth] Confirming login for:', credentials.phoneNumber);
      
      const response = await this.httpClient.post<any>(
        AUTH_ENDPOINTS.CONFIRM_LOGIN,
        {
          pattern: 'VerificationSms',
          phoneNumber: credentials.phoneNumber,
          code: credentials.code,
        },
        {
          headers: {
            'X-Client-Type': 'web', // ارسال هدر الزامی
          }
        }
      );

      const rawUser = response.data?.data || response.data;
      
      if (!rawUser || typeof rawUser !== 'object') {
        throw new Error('ساختار داده کاربر دریافتی از سرور معتبر نیست.');
      }

      const user = AuthMapper.toDomain(rawUser);
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
   * دریافت پروفایل کاربری معتبر فعلی
   * این متد قابلیت دریافت هدر (مثل کوکی) را دارد تا در سمت سرور (SSR) هم کار کند.
   */
  async getCurrentUser(reqHeaders?: Record<string, string>): Promise<User | null> {
    try {
      logger.debug('[Auth] Getting current user profile');
      
      const response = await this.httpClient.get<any>(
        AUTH_ENDPOINTS.GET_USER,
        {
          // اگر در سمت سرور هستیم، کوکی رو به بک‌اند پاس می‌دهیم
          headers: reqHeaders ? { Cookie: reqHeaders.cookie } : undefined,
        }
      );

      if (!response.data) {
        return null;
      }

      return AuthMapper.toDomain(response.data);
    } catch (error) {
      // در صورت 401 بودن، مقدار null برمی‌گردد
      return null;
    }
  }
}

let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}