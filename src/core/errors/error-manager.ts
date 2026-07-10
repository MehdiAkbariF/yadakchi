// src/core/errors/error-manager.ts

import { ApiError } from './api-error';
import { ErrorType } from './types/error.types';
import { ErrorNormalizer } from './error-normalizer';
import { logger } from '../utils/logger';

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
    this.registerHandler({
      canHandle: (error) => error.type === ErrorType.VALIDATION,
      handle: (error) => {
        logger.debug('Validation error:', error.getFieldErrors());
      },
      getPriority: () => 10,
    });

    this.registerHandler({
      canHandle: (error) => error.type === ErrorType.UNAUTHORIZED,
      handle: (error) => {
        logger.warn('Unauthorized access:', error.message);
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
      },
      getPriority: () => 7,
    });

    this.registerHandler({
      canHandle: (error) => error.isNetworkError(),
      handle: (error) => {
        logger.error('Network error:', error.message);
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
      },
      getPriority: () => 0,
    });
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