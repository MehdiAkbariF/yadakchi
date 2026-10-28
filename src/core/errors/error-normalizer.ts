// src/core/errors/error-normalizer.ts

import axios, { AxiosError } from 'axios';
import { ApiError } from './api-error';
import { ErrorType, ErrorDetail } from './types/error.types';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface NormalizedErrorDetails {
  message: string;
  userMessage?: string;
  details?: ErrorDetail[];
}

interface ApiErrorLikeResponse {
  status: number;
  message?: unknown;
  error?: unknown;
  errors?: unknown;
  userMessage?: unknown;
  user_message?: unknown;
  errorMessage?: unknown;
  error_message?: unknown;
}

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_USER_MESSAGE = 'خطایی رخ داده است.';

const STATUS_TO_USER_MESSAGE: Record<number, string> = {
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

/* -------------------------------------------------------------------------- */
/*                                  Helper                                    */
/* -------------------------------------------------------------------------- */

function looksLikeHtml(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<body') ||
    /<\/?[a-z][\s\S]*>/i.test(trimmed)
  );
}

/**
 * ساخت ApiError به‌صورت امن.
 * اگر سازنده ApiError به هر دلیلی throw کند، یک ApiError ساده برمی‌گرداند.
 */
function safeCreateApiError(params: {
  type: ErrorType;
  status?: number;
  message: string;
  userMessage?: string;
  details?: ErrorDetail[];
  originalError: unknown;
}): ApiError {
  const message = params.message?.trim() || 'Unknown error';
  const userMessage = params.userMessage?.trim() || DEFAULT_USER_MESSAGE;

  try {
    return new ApiError({
      type: params.type,
      status: params.status,
      message,
      userMessage,
      details: params.details,
      originalError: params.originalError,
    });
  } catch {
    try {
      return new ApiError({
        type: ErrorType.UNKNOWN,
        status: params.status,
        message: 'Unknown error',
        userMessage: DEFAULT_USER_MESSAGE,
        originalError: params.originalError,
      });
    } catch {
      // 🚨 آخرین سنگر: اگر حتی ApiError با ورودی حداقلی هم ساخت نشد،
      // یک Error استاندارد برمی‌گردانیم (به عنوان fallback نهایی)
      const err = new Error(message) as Error & {
        type?: ErrorType;
        status?: number;
        userMessage?: string;
        originalError?: unknown;
      };
      err.type = ErrorType.UNKNOWN;
      err.status = params.status;
      err.userMessage = DEFAULT_USER_MESSAGE;
      err.originalError = params.originalError;
      return err as unknown as ApiError;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              ErrorNormalizer                               */
/* -------------------------------------------------------------------------- */

export class ErrorNormalizer {
  static normalize(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      return this.normalizeAxiosError(error);
    }

    if (this.isApiErrorResponse(error)) {
      return this.normalizeApiResponse(error);
    }

    if (this.isAbortError(error)) {
      return safeCreateApiError({
        type: ErrorType.ABORTED,
        message: 'Request aborted',
        userMessage: 'درخواست لغو شد.',
        originalError: error,
      });
    }

    if (this.isErrorObject(error)) {
      return safeCreateApiError({
        type: ErrorType.UNKNOWN,
        message: error.message || 'Unknown error',
        userMessage: 'خطای ناشناخته‌ای رخ داده است.',
        originalError: error,
      });
    }

    return safeCreateApiError({
      type: ErrorType.UNKNOWN,
      message: 'Unknown error occurred',
      userMessage: 'خطای ناشناخته‌ای رخ داده است.',
      originalError: error,
    });
  }

  /* ------------------------------------------------------------------------ */
  /*                              Type Guards                                 */
  /* ------------------------------------------------------------------------ */

  private static isErrorObject(error: unknown): error is Error {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    );
  }

  private static isAbortError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: unknown }).name === 'AbortError'
    );
  }

  private static isApiErrorResponse(error: unknown): error is ApiErrorLikeResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status: unknown }).status === 'number' &&
      Number.isFinite((error as { status: number }).status)
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                            Axios Normalizer                              */
  /* ------------------------------------------------------------------------ */

  private static normalizeAxiosError(error: AxiosError): ApiError {
    if (error.code === 'ERR_NETWORK') {
      return safeCreateApiError({
        type: ErrorType.NETWORK,
        message: error.message,
        userMessage: 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.',
        originalError: error,
      });
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return safeCreateApiError({
        type: ErrorType.TIMEOUT,
        message: error.message,
        userMessage: 'درخواست زمان‌بر بود. مجدداً تلاش کنید.',
        originalError: error,
      });
    }

    if (error.response) {
      const status = error.response.status;
      const rawData: unknown = error.response.data;

      if (typeof rawData === 'string' && looksLikeHtml(rawData)) {
        return safeCreateApiError({
          type: this.getErrorTypeFromStatus(status),
          status,
          message: `HTTP ${status} returned HTML instead of JSON`,
          userMessage:
            STATUS_TO_USER_MESSAGE[status] ??
            'سرویس در دسترس نیست. لطفاً دوباره تلاش کنید.',
          originalError: error,
        });
      }

      const errorDetails = this.extractErrorDetails(rawData);

      return safeCreateApiError({
        type: this.getErrorTypeFromStatus(status),
        status,
        message: errorDetails?.message || error.message,
        userMessage:
          errorDetails?.userMessage ??
          STATUS_TO_USER_MESSAGE[status] ??
          DEFAULT_USER_MESSAGE,
        details: errorDetails?.details,
        originalError: error,
      });
    }

    return safeCreateApiError({
      type: ErrorType.UNKNOWN,
      message: error.message,
      userMessage: 'خطایی در ارسال درخواست رخ داده است.',
      originalError: error,
    });
  }

  /* ------------------------------------------------------------------------ */
  /*                          API Response Normalizer                         */
  /* ------------------------------------------------------------------------ */

  private static normalizeApiResponse(error: ApiErrorLikeResponse): ApiError {
    const status = Number.isFinite(error.status) ? error.status : 500;
    const type = this.getErrorTypeFromStatus(status);

    const details: ErrorDetail[] = [];
    if (Array.isArray(error.errors)) {
      for (const item of error.errors) {
        if (typeof item === 'string') {
          details.push({ message: item });
          continue;
        }
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          details.push({
            field:
              typeof obj.field === 'string'
                ? obj.field
                : typeof obj.property === 'string'
                  ? obj.property
                  : undefined,
            message:
              typeof obj.message === 'string'
                ? obj.message
                : typeof obj.error === 'string'
                  ? obj.error
                  : 'Unknown error',
            code: typeof obj.code === 'string' ? obj.code : undefined,
          });
        }
      }
    }

    const rawMessage =
      (typeof error.message === 'string' && error.message) ||
      (typeof error.error === 'string' && error.error) ||
      'Unknown error';

    return safeCreateApiError({
      type,
      status,
      message: rawMessage,
      userMessage: this.getUserMessageFromError(error, status),
      details: details.length > 0 ? details : undefined,
      originalError: error,
    });
  }

  /* ------------------------------------------------------------------------ */
  /*                                 Helpers                                  */
  /* ------------------------------------------------------------------------ */

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

  private static extractErrorDetails(data: unknown): NormalizedErrorDetails | null {
    if (data === null || data === undefined) return null;

    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (!trimmed) return null;

      if (looksLikeHtml(trimmed)) {
        const stripped = trimmed
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          message: stripped.slice(0, 200) || 'Server error',
          userMessage: 'سرویس در دسترس نیست.',
        };
      }

      return { message: trimmed, userMessage: trimmed };
    }

    if (typeof data !== 'object') return null;

    const obj = data as Record<string, unknown>;

    if (
      obj.errors &&
      typeof obj.errors === 'object' &&
      !Array.isArray(obj.errors)
    ) {
      const errorKeys = Object.keys(obj.errors as Record<string, unknown>);
      if (errorKeys.length > 0) {
        const firstKey = errorKeys[0];
        const list = (obj.errors as Record<string, unknown>)[firstKey];

        if (Array.isArray(list) && list.length > 0) {
          const persianMsg =
            list.find(
              (msg): msg is string =>
                typeof msg === 'string' && /^[\u0600-\u06FF]/.test(msg),
            ) ?? (typeof list[0] === 'string' ? list[0] : undefined);

          if (persianMsg) {
            return { message: persianMsg, userMessage: persianMsg };
          }
        }
      }
    }

    const rawMessage =
      (typeof obj.message === 'string' && obj.message) ||
      (typeof obj.error === 'string' && obj.error) ||
      (typeof obj.errorMessage === 'string' && obj.errorMessage) ||
      (typeof obj.error_message === 'string' && obj.error_message) ||
      (typeof obj.userMessage === 'string' && obj.userMessage) ||
      (typeof obj.user_message === 'string' && obj.user_message) ||
      (typeof obj.errors === 'string' && obj.errors) ||
      '';

    if (rawMessage) {
      return {
        message: rawMessage,
        userMessage: rawMessage,
        details: Array.isArray(obj.errors)
          ? (obj.errors as ErrorDetail[])
          : undefined,
      };
    }

    return null;
  }

  private static getUserMessageFromError(
    error: ApiErrorLikeResponse,
    status: number,
  ): string {
    if (typeof error.userMessage === 'string' && error.userMessage.trim()) {
      return error.userMessage;
    }
    if (typeof error.user_message === 'string' && error.user_message.trim()) {
      return error.user_message;
    }

    return STATUS_TO_USER_MESSAGE[status] || DEFAULT_USER_MESSAGE;
  }
}