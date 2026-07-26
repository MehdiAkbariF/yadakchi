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
        throw new Error('ساختار داده کاربر دریافت‌شده از سرور معتبر نیست.');
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
   * اصلاح اساسی: فقط در صورت خطای ۴۰۱ یا ۴۰۳ مقدار null (کاربر مهمان) برمی‌گرداند.
   * در صورت قطعی سرور (۵۰۲ یا ۵۰۳)، خطا را بالا می‌فرستد تا کاربر از پروفایل خود لاگ‌اوت نشود.
   */
  async getCurrentUser(reqHeaders?: Record<string, string>): Promise<User | null> {
    try {
      logger.debug('[Auth] Getting current user profile');
      
      const response = await this.httpClient.get<any>(
        AUTH_ENDPOINTS.GET_USER,
        {
          headers: reqHeaders ? { Cookie: reqHeaders.cookie } : undefined,
        }
      );

      if (!response.data) {
        return null;
      }

      return AuthMapper.toDomain(response.data);
    } catch (error: any) {
      // فقط در صورت خطای رسمی عدم دسترسی یا احراز هویت، کاربر به عنوان مهمان (null) علامت‌گذاری می‌شود
      if (
        error?.status === 401 || 
        error?.status === 403 || 
        error?.type === 'unauthorized' ||
        error?.message?.includes('401')
      ) {
        return null;
      }

      // در خطاهای مربوط به درگاه یا سرور (نظیر ۵۰۲ یا ۵۰۳)، خطا پرتاب می‌شود تا کاربر به اشتباه بیرون انداخته نشود
      throw errorManager.normalize(error);
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