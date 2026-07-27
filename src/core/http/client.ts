// src/core/http/client.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { errorManager } from '../errors/error-manager';
import { ApiError } from '../errors/api-error';
import { HttpResponse, RequestOptions, HttpMethod } from './types';
import http from 'http'; // ماژول بومی اتصال شبکه سرور
import https from 'https'; // ماژول بومی اتصال امن سرور

/*
  بهینه‌سازی شبکه فوق حرفه‌ای در لایه سرور (Connection Pooling & Keep-Alive):
  ایجاد مأمورهای اتصال زنده و مستمر در سمت سرور Node.js. با این تکنیک، کانکشن‌های فیزیکی 
  TCP/SSL بین سرور فرانت‌اند و بک‌اند باز نگه‌داشته می‌شوند تا تاخیر دست‌دادن امن (SSL Handshake)
  برای همیشه برطرف شده و انتقال بین صفحات در کسری از ثانیه انجام شود.
*/
const keepAliveHttpAgent = typeof window === 'undefined'
  ? new http.Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000 })
  : null;

const keepAliveHttpsAgent = typeof window === 'undefined'
  ? new https.Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000 })
  : null;

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();
  private serverRequestConfig: Record<string, any> = {};
  private isRefreshing = false;
  private failedQueue: { resolve: (value: any) => void; reject: (reason: any) => void }[] = [];

  constructor() {
    const baseURL = typeof window === 'undefined'
      ? (env.apiBaseUrl || 'https://api.yadakchi.com')
      : '/proxy-api';
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: env.apiTimeout,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': env.appVersion,
      },
      // اعمال اتصال‌های زنده در سمت سرور جهت بهینه‌سازی سرعت پاسخ‌دهی
      httpAgent: keepAliveHttpAgent,
      httpsAgent: keepAliveHttpsAgent,
    });

    this.setupInterceptors();
  }

  setServerConfig(config: Record<string, any>) {
    this.serverRequestConfig = config;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (typeof window === 'undefined' && this.serverRequestConfig?.headers) {
          config.headers = {
            ...config.headers,
            ...this.serverRequestConfig.headers,
          };
        }

        if (env.enableLogging) {
          logger.debug(`[HTTP] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        return config;
      },
      (error) => {
        logger.error('[HTTP] Request error', error);
        return Promise.reject(error);
      }
    );

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
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const requestUrl = originalRequest.url || '';

          if (currentPath === '/login') {
            return Promise.reject(errorManager.normalize(error));
          }

          const isPassiveAuthCheck = 
            requestUrl.includes('/User') || 
            requestUrl.includes('/Refresh') || 
            requestUrl.includes('/get-user') ||
            requestUrl.includes('/GetFrontBasket') ||
            requestUrl.includes('/IsUserFavoriteProduct') ||
            requestUrl.includes('/UserVehicle');

          if (isPassiveAuthCheck) {
            return Promise.reject(errorManager.normalize(error));
          }

          if (originalRequest._retry) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            return Promise.reject(errorManager.normalize(error));
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.axiosInstance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          return new Promise((resolve, reject) => {
            this.axiosInstance.post('/api/Login/Refresh')
              .then(() => {
                this.failedQueue.forEach((prom) => prom.resolve(null));
                this.failedQueue = [];
                resolve(this.axiosInstance(originalRequest));
              })
              .catch((refreshError) => {
                this.failedQueue.forEach((prom) => prom.reject(refreshError));
                this.failedQueue = [];
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                reject(refreshError);
              })
              .finally(() => {
                this.isRefreshing = false;
              });
          });
        }

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
        params: options?.params,
        headers: options?.headers,
        timeout: options?.timeout ?? env.apiTimeout,
        signal,
        withCredentials: true, 
      };

      if (data !== undefined) {
        config.data = data;
      }

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

  async delete<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('DELETE', url, data, options);
  }

  async cancelRequest(requestId: string): Promise<void> {
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

let httpClientInstance: HttpClient | null = null;

export function getHttpClient(): HttpClient {
  if (typeof window === 'undefined') {
    return new HttpClient();
  }
  if (!httpClientInstance) {
    httpClientInstance = new HttpClient();
  }
  return httpClientInstance;
}