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
          pattern: 'VerificationSms', // متد اجباری ارسال پیامک در بک‌اند
          phoneNumber: credentials.phoneNumber,
        },
        {
          headers: {
            'X-Client': 'Web', // ارسال هدر الزامی x-client در لاگین
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
   * استفاده مستقیم از داده‌های پاسخِ لود شده برای حل باگ Race Condition کوکی‌ها
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
            'X-Client': 'Web', // ارسال هدر الزامی x-client در تایید otp
          }
        }
      );

      // استخراج آبجکت کاربر به صورت منعطف (مستقیماً از روت پاسخ یا داخل آبجکت data)
      const rawUser = response.data?.data || response.data;
      
      if (!rawUser || typeof rawUser !== 'object') {
        throw new Error('ساختار داده کاربر دریافتی از سرور معتبر نیست.');
      }

      // نگاشت و تبدیل مستقیم داده‌های دریافتی لاگین بدون نیاز به ارسال درخواست ثانویه و مواجهه با خطای ۴۰۱
      const user = AuthMapper.toDomain(rawUser);
      logger.info('[Auth] User logged in successfully via Confirm body:', user.id);
      return user;
    } catch (error) {
      logger.error('[Auth] Confirm login failed:', error);
      throw errorManager.normalize(error);
    }
  }

  /**
   * خروج از سیستم و حذف کوکی‌های نشست در بک‌اند
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
   * دریافت پروفایل و اطلاعات کاربری معتبر جاری
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      logger.debug('[Auth] Getting current user profile');
      
      const response = await this.httpClient.get<any>(
        AUTH_ENDPOINTS.GET_USER
      );

      if (!response.data) {
        return null;
      }

      return AuthMapper.toDomain(response.data);
    } catch (error) {
      // در صورت غیر معتبر بودن نشست یا ارور ۴۰۱، بدون پرتاب خطا مقدار null بازمی‌گردانیم
      return null;
    }
  }
}

// ایجاد و بازگردانی سینگلتون سرویس
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}