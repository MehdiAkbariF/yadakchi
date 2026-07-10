// src/core/errors/error-normalizer.ts

import axios, { AxiosError } from 'axios';
import { ApiError } from './api-error';
import { ErrorType, ErrorDetail } from './types/error.types';

export class ErrorNormalizer {
  static normalize(error: unknown): ApiError {
    // Axios Error
    if (axios.isAxiosError(error)) {
      return this.normalizeAxiosError(error);
    }

    // API Error Response
    if (this.isApiErrorResponse(error)) {
      return this.normalizeApiResponse(error);
    }

    // DOM Exception (AbortError)
    if (this.isAbortError(error)) {
      return new ApiError({
        type: ErrorType.ABORTED,
        message: 'Request aborted',
        userMessage: 'درخواست لغو شد.',
        originalError: error,
      });
    }

    // Standard Error - استفاده از type assertion
    if (this.isErrorObject(error)) {
      const err = error as Error;
      return new ApiError({
        type: ErrorType.UNKNOWN,
        message: err.message || 'Unknown error',
        userMessage: 'خطای ناشناخته‌ای رخ داده است.',
        originalError: error,
      });
    }

    // Unknown error
    return new ApiError({
      type: ErrorType.UNKNOWN,
      message: 'Unknown error occurred',
      userMessage: 'خطای ناشناخته‌ای رخ داده است.',
      originalError: error,
    });
  }

  // Type guard برای تشخیص Error Object
  private static isErrorObject(error: unknown): error is Error {
    // بررسی اینکه error یک شیء است و property message دارد
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string'
    );
  }

  // Type guard برای تشخیص AbortError
  private static isAbortError(error: unknown): error is DOMException {
    return (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as any).name === 'AbortError'
    );
  }

  private static normalizeAxiosError(error: AxiosError): ApiError {
    // Network error
    if (error.code === 'ERR_NETWORK') {
      return new ApiError({
        type: ErrorType.NETWORK,
        message: error.message,
        userMessage: 'ارتباط با سرور برقرار نشد.',
        originalError: error,
      });
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ApiError({
        type: ErrorType.TIMEOUT,
        message: error.message,
        userMessage: 'درخواست زمان‌بر بود.',
        originalError: error,
      });
    }

    // Response error
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      const errorDetails = this.extractErrorDetails(data);
      const type = this.getErrorTypeFromStatus(status);
      
      return new ApiError({
        type,
        status,
        message: errorDetails?.message || error.message,
        userMessage: errorDetails?.userMessage,
        details: errorDetails?.details,
        originalError: error,
      });
    }

    // Request error (no response)
    return new ApiError({
      type: ErrorType.UNKNOWN,
      message: error.message,
      userMessage: 'خطایی در ارسال درخواست رخ داده است.',
      originalError: error,
    });
  }

  private static normalizeApiResponse(error: any): ApiError {
    const status = error.status || 500;
    const type = this.getErrorTypeFromStatus(status);

    const details: ErrorDetail[] = [];
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: any) => {
        if (typeof err === 'string') {
          details.push({ message: err });
        } else if (typeof err === 'object') {
          details.push({
            field: err.field || err.property,
            message: err.message || err.error,
            code: err.code,
          });
        }
      });
    }

    return new ApiError({
      type,
      status,
      message: error.message || error.error || 'Unknown error',
      userMessage: this.getUserMessageFromError(error),
      details: details.length > 0 ? details : undefined,
      originalError: error,
    });
  }

  private static getErrorTypeFromStatus(status: number): ErrorType {
    const statusMap: Record<number, ErrorType> = {
      400: ErrorType.BAD_REQUEST,
      401: ErrorType.UNAUTHORIZED,
      403: ErrorType.FORBIDDEN,
      404: ErrorType.NOT_FOUND,
      409: ErrorType.CONFLICT,
      422: ErrorType.VALIDATION,
      429: ErrorType.RATE_LIMIT,
      500: ErrorType.SERVER_ERROR,
      503: ErrorType.SERVICE_UNAVAILABLE,
    };

    return statusMap[status] || ErrorType.UNKNOWN;
  }

  private static extractErrorDetails(data: any): {
    message: string;
    userMessage?: string;
    details?: ErrorDetail[];
  } | null {
    if (!data || typeof data !== 'object') return null;

    if (data.message) {
      return {
        message: data.message,
        userMessage: data.userMessage || data.user_message,
        details: data.errors || data.details,
      };
    }

    if (data.error) {
      return {
        message: data.error,
        userMessage: data.userMessage || data.user_message,
        details: data.errors || data.details,
      };
    }

    return null;
  }

  private static getUserMessageFromError(error: any): string {
    if (error.userMessage) return error.userMessage;
    if (error.user_message) return error.user_message;
    
    const defaultMessages: Record<number, string> = {
      400: 'اطلاعات وارد شده صحیح نیست.',
      401: 'لطفاً مجدداً وارد حساب کاربری خود شوید.',
      403: 'شما دسترسی لازم را ندارید.',
      404: 'اطلاعات مورد نظر یافت نشد.',
      409: 'اطلاعات تکراری است.',
      422: 'لطفاً اطلاعات را بررسی کنید.',
      429: 'تعداد درخواست‌ها بیش از حد مجاز است.',
      500: 'خطای سرور. لطفاً دوباره تلاش کنید.',
      503: 'سرویس در دسترس نیست.',
    };

    return defaultMessages[error.status] || 'خطایی رخ داده است.';
  }

  private static isApiErrorResponse(error: unknown): error is any {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as any).status === 'number'
    );
  }
}