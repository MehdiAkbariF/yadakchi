// src/core/errors/api-error.ts

import { ErrorType, ErrorSeverity, ErrorDetail } from './types/error.types';

export class ApiError extends Error {
  readonly type: ErrorType;
  readonly status?: number;
  readonly severity: ErrorSeverity;
  readonly details?: ErrorDetail[];
  readonly userMessage: string;
  readonly technicalMessage?: string;
  readonly timestamp: string;
  readonly originalError?: unknown;

  constructor(config: {
    type: ErrorType;
    status?: number;
    message: string;
    userMessage?: string;
    technicalMessage?: string;
    details?: ErrorDetail[];
    severity?: ErrorSeverity;
    originalError?: unknown;
  }) {
    super(config.message);
    this.name = 'ApiError';
    
    this.type = config.type;
    this.status = config.status;
    this.severity = config.severity || this.determineSeverity(config.type);
    this.details = config.details;
    this.userMessage = config.userMessage || this.getDefaultUserMessage(config.type);
    this.technicalMessage = config.technicalMessage;
    this.timestamp = new Date().toISOString();
    this.originalError = config.originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  private determineSeverity(type: ErrorType): ErrorSeverity {
    const severityMap: Record<ErrorType, ErrorSeverity> = {
      [ErrorType.VALIDATION]: ErrorSeverity.LOW,
      [ErrorType.BAD_REQUEST]: ErrorSeverity.LOW,
      [ErrorType.UNAUTHORIZED]: ErrorSeverity.MEDIUM,
      [ErrorType.FORBIDDEN]: ErrorSeverity.HIGH,
      [ErrorType.NOT_FOUND]: ErrorSeverity.MEDIUM,
      [ErrorType.CONFLICT]: ErrorSeverity.MEDIUM,
      [ErrorType.RATE_LIMIT]: ErrorSeverity.MEDIUM,
      [ErrorType.SERVER_ERROR]: ErrorSeverity.HIGH,
      [ErrorType.SERVICE_UNAVAILABLE]: ErrorSeverity.HIGH,
      [ErrorType.NETWORK]: ErrorSeverity.MEDIUM,
      [ErrorType.TIMEOUT]: ErrorSeverity.MEDIUM,
      [ErrorType.ABORTED]: ErrorSeverity.LOW,
      [ErrorType.BUSINESS]: ErrorSeverity.MEDIUM,
      [ErrorType.PERMISSION]: ErrorSeverity.HIGH,
      [ErrorType.UNKNOWN]: ErrorSeverity.CRITICAL,
    };

    return severityMap[type] || ErrorSeverity.MEDIUM;
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.VALIDATION]: 'لطفاً اطلاعات وارد شده را بررسی کنید.',
      [ErrorType.BAD_REQUEST]: 'درخواست نامعتبر است.',
      [ErrorType.UNAUTHORIZED]: 'لطفاً مجدداً وارد حساب کاربری خود شوید.',
      [ErrorType.FORBIDDEN]: 'شما دسترسی لازم برای این عملیات را ندارید.',
      [ErrorType.NOT_FOUND]: 'اطلاعات مورد نظر یافت نشد.',
      [ErrorType.CONFLICT]: 'اطلاعات تکراری است.',
      [ErrorType.RATE_LIMIT]: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.',
      [ErrorType.SERVER_ERROR]: 'خطایی در سرور رخ داده است. لطفاً دوباره تلاش کنید.',
      [ErrorType.SERVICE_UNAVAILABLE]: 'سرویس در حال حاضر در دسترس نیست.',
      [ErrorType.NETWORK]: 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.',
      [ErrorType.TIMEOUT]: 'درخواست شما زمان‌بر بود. لطفاً دوباره تلاش کنید.',
      [ErrorType.ABORTED]: 'درخواست لغو شد.',
      [ErrorType.BUSINESS]: 'عملیات با شکست مواجه شد.',
      [ErrorType.PERMISSION]: 'شما مجوز انجام این عملیات را ندارید.',
      [ErrorType.UNKNOWN]: 'خطای ناشناخته‌ای رخ داده است.',
    };

    return messages[type] || 'خطایی رخ داده است. لطفاً دوباره تلاش کنید.';
  }

  isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  isNetworkError(): boolean {
    return [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.ABORTED].includes(this.type);
  }

  isAuthenticationError(): boolean {
    return [ErrorType.UNAUTHORIZED, ErrorType.FORBIDDEN].includes(this.type);
  }

  getFieldErrors(): Record<string, string> {
    if (!this.details || this.details.length === 0) {
      return {};
    }

    return this.details.reduce((acc, detail) => {
      if (detail.field) {
        acc[detail.field] = detail.message;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      status: this.status,
      message: this.message,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      details: this.details,
      severity: this.severity,
      timestamp: this.timestamp,
    };
  }
}