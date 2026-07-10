// src/core/http/client.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { errorManager } from '../errors/error-manager';
import { ApiError } from '../errors/api-error';
import { HttpResponse, RequestOptions, HttpMethod } from './types';

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    // آدرس پایه را خالی می‌گذاریم تا از مسیرهای نسبی استفاده شود
    const baseURL = env.apiBaseUrl || '';
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: env.apiTimeout,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': env.appVersion,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // اگر آدرس کامل است و با http شروع می‌شود، از آن استفاده کن
        if (config.url?.startsWith('http')) {
          // آدرس کامل است، تغییری نده
        } else if (!config.url?.startsWith('/api/')) {
          // اگر با /api/ شروع نشده، اضافه کن
          config.url = `/api/${config.url}`;
        }

        if (env.enableLogging) {
          logger.debug(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        // اضافه کردن headers برای جلوگیری از CORS
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Credentials'] = 'true';

        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        return config;
      },
      (error) => {
        logger.error('[HTTP] Request error', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (env.enableLogging) {
          logger.debug(`[HTTP] Response ${response.status} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      (error) => {
        const apiError = errorManager.normalize(error);
        
        logger.error('[HTTP] Response error', {
          type: apiError.type,
          status: apiError.status,
          message: apiError.message,
          userMessage: apiError.userMessage,
        });

        return Promise.reject(apiError);
      }
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private async makeRequest<T = unknown>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    let signal = options?.signal;
    let controller: AbortController | undefined;

    if (!signal) {
      controller = new AbortController();
      signal = controller.signal;
      this.abortControllers.set(requestId, controller);
    }

    try {
      const config: AxiosRequestConfig = {
        method,
        url,
        data,
        params: options?.params,
        headers: options?.headers,
        timeout: options?.timeout ?? env.apiTimeout,
        signal,
      };

      const response = await this.axiosInstance.request<T>(config);

      if (controller) {
        this.abortControllers.delete(requestId);
      }

      const duration = Date.now() - startTime;

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        config: {
          url: response.config.url || '',
          method: response.config.method as HttpMethod,
          data: response.config.data,
          params: response.config.params,
          headers: response.config.headers as Record<string, string>,
        },
        duration,
      };
    } catch (error) {
      if (controller) {
        this.abortControllers.delete(requestId);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      const apiError = errorManager.normalize(error);
      throw apiError;
    }
  }

  // Public Methods
  async get<T = unknown>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('GET', url, undefined, options);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('POST', url, data, options);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, options);
  }

  async delete<T = unknown>(url: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('DELETE', url, undefined, options);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('PATCH', url, data, options);
  }

  // Utility Methods
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  setBaseURL(url: string): void {
    this.axiosInstance.defaults.baseURL = url;
  }

  setDefaultTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }
}

// Singleton instance
let httpClientInstance: HttpClient | null = null;

export function getHttpClient(): HttpClient {
  if (!httpClientInstance) {
    httpClientInstance = new HttpClient();
  }
  return httpClientInstance;
}