import { ApiError } from './api-error';
import { ErrorType } from './types/error.types';
import { ErrorNormalizer } from './error-normalizer';
import { logger } from '../utils/logger';
import { showToast } from '../utils/toast';

export interface ErrorHandler {
  canHandle(error: ApiError): boolean;
  handle(error: ApiError): void;
  getPriority(): number;
}

export class ErrorManager {
  private static instance: ErrorManager;
  private handlers: ErrorHandler[] = [];

  private constructor() {
    this.registerDefaultHandlers();
  }

  static getInstance(): ErrorManager {
    if (!this.instance) {
      this.instance = new ErrorManager();
    }
    return this.instance;
  }

  private registerDefaultHandlers(): void {
    // ۱. هندلر متمرکز و با اولویت بالای خطاهای سروری ۵۰۲ و ۵۰۳ (هدایت امن به صفحه بروزرسانی بدون تخریب سشن کاربر)
    this.registerHandler({
      canHandle: (error) => 
        error.status === 502 || 
        error.status === 503 || 
        error.type === ErrorType.SERVICE_UNAVAILABLE,
      handle: (error) => {
        logger.error('[ErrorManager] Server maintenance / Bad Gateway detected:', error.message);
        
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // انتقال امن به صفحه بروزرسانی بدون تغییر کوکی‌ها یا از بین بردن حالت ورود کاربر
          if (currentPath !== '/maintenance') {
            window.location.href = '/maintenance';
          }
        }
      },
      getPriority: () => 11, // بالاترین اولویت برای خطاهای حیاتی سرور
    });

    this.registerHandler({
      canHandle: (error) => error.type === ErrorType.VALIDATION,
      handle: (error) => {
        logger.debug('Validation error:', error.getFieldErrors());
        this.triggerToastIfNeeded(error);
      },
      getPriority: () => 10,
    });

    this.registerHandler({
      canHandle: (error) => error.type === ErrorType.UNAUTHORIZED,
      handle: (error) => {
        logger.warn('Unauthorized access:', error.message);
        
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const originalError = error.originalError as any;
          const requestUrl = originalError?.config?.url || '';

          const isPassiveAuthCheck = 
            requestUrl.includes('/User') || 
            requestUrl.includes('/Refresh') || 
            requestUrl.includes('/get-user');

          if (currentPath !== '/login' && !isPassiveAuthCheck && currentPath !== '/maintenance') {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      },
      getPriority: () => 9,
    });

    this.registerHandler({
      canHandle: (error) => error.type === ErrorType.FORBIDDEN,
      handle: (error) => {
        logger.warn('Forbidden access:', error.message);
      },
      getPriority: () => 8,
    });

    this.registerHandler({
      canHandle: (error) => error.type === ErrorType.RATE_LIMIT,
      handle: (error) => {
        logger.warn('Rate limit exceeded:', error.message);
        this.triggerToastIfNeeded(error);
      },
      getPriority: () => 7,
    });

    this.registerHandler({
      canHandle: (error) => error.isNetworkError(),
      handle: (error) => {
        logger.error('Network error:', error.message);
        this.triggerToastIfNeeded(error);
      },
      getPriority: () => 6,
    });

    this.registerHandler({
      canHandle: (error) => error.type === ErrorType.NOT_FOUND,
      handle: (error) => {
        logger.warn('Not found:', error.message);
      },
      getPriority: () => 5,
    });

    this.registerHandler({
      canHandle: () => true,
      handle: (error) => {
        logger.error('Unhandled error:', {
          type: error.type,
          status: error.status,
          message: error.message,
          userMessage: error.userMessage,
          details: error.details,
        });
        this.triggerToastIfNeeded(error);
      },
      getPriority: () => 0,
    });
  }

  private triggerToastIfNeeded(error: ApiError): void {
    const originalError = error.originalError as any;
    const method = originalError?.config?.method?.toLowerCase();
    const isMutation = method && method !== 'get';

    if (isMutation && error.type !== ErrorType.ABORTED) {
      showToast.error(error.userMessage);
    }
  }

  registerHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
    this.handlers.sort((a, b) => b.getPriority() - a.getPriority());
  }

  handleError(error: unknown): void {
    const apiError = this.normalize(error);
    
    const handler = this.handlers.find(h => h.canHandle(apiError));
    
    if (handler) {
      handler.handle(apiError);
    } else {
      logger.error('No handler found for error:', apiError);
    }
  }

  normalize(error: unknown): ApiError {
    return ErrorNormalizer.normalize(error);
  }
}

export const errorManager = ErrorManager.getInstance();