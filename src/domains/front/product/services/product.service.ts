// src/domains/front/product/services/product.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { PRODUCT_ENDPOINTS } from '../endpoints/product.endpoints';
import { ProductMapper } from '../mappers/product.mapper';
import { SearchProductsRequest, ProductViewModel, ProductPriceChartViewModel } from '@/domains/front/product/types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class ProductService {
  private readonly httpClient = getHttpClient();

  async searchProducts(request: SearchProductsRequest): Promise<PaginatedResult<ProductViewModel>> {
    try {
      const dto = ProductMapper.toDomainSearchRequest(request);
      logger.debug('[ProductService] Searching products with params:', dto);
      
      const response = await this.httpClient.get<any>(
        PRODUCT_ENDPOINTS.SEARCH_PRODUCTS,
        { params: dto as Record<string, unknown> }
      );

      const productsData = response.data.products;
      
      if (!productsData || !productsData.items) {
        return {
          items: [],
          pageNumber: 1,
          pageSize: 8,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          hasMore: false,
          from: 1,
          to: 0,
        };
      }

      const items = productsData.items.map((item: any) => {
        const domain = ProductMapper.toDomain(item);
        return ProductMapper.toView(domain);
      });

      return {
        items,
        pageNumber: productsData.currentPage,
        pageSize: productsData.pageSize,
        totalCount: productsData.totalCount,
        totalPages: productsData.totalPages,
        hasNextPage: productsData.currentPage < productsData.totalPages,
        hasPreviousPage: productsData.currentPage > 1,
        hasMore: productsData.currentPage < productsData.totalPages,
        from: (productsData.currentPage - 1) * productsData.pageSize + 1,
        to: Math.min(productsData.currentPage * productsData.pageSize, productsData.totalCount),
      };
    } catch (error) {
      logger.error('[ProductService] Search products failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getProductDetails(productCode: number): Promise<ProductViewModel> {
    try {
      const response = await this.httpClient.get<any>(
        PRODUCT_ENDPOINTS.GET_PRODUCT,
        { params: { ProductCode: productCode } }
      );

      const domain = ProductMapper.toDomain(response.data);
      return ProductMapper.toView(domain);
    } catch (error) {
      logger.error('[ProductService] Get product details failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getRelatedProducts(productCode: number): Promise<ProductViewModel[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        PRODUCT_ENDPOINTS.GET_RELATED_PRODUCTS,
        { params: { ProductCode: productCode } }
      );

      return response.data.map(item => {
        const domain = ProductMapper.toDomain(item);
        return ProductMapper.toView(domain);
      });
    } catch (error) {
      logger.error('[ProductService] Get related products failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getProductPriceChart(productId: string, shopProductType: 'New' | 'Stock' | 'TakeOff'): Promise<ProductPriceChartViewModel> {
    try {
      const response = await this.httpClient.get<any>(
        PRODUCT_ENDPOINTS.GET_PRICE_CHART,
        { params: { ProductId: productId, ShopProductType: shopProductType } }
      );

      return ProductMapper.toViewPriceChart(response.data);
    } catch (error) {
      logger.error('[ProductService] Get price chart failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getSearchSuggestions(searchTitle?: string): Promise<string[]> {
    try {
      const response = await this.httpClient.get<string[]>(
        PRODUCT_ENDPOINTS.SEARCH_SUGGESTIONS,
        { params: { SearchTitle: searchTitle || '' } }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('[ProductService] Get search suggestions failed:', error);
      return [];
    }
  }

  async getSearchKeywords(searchTitle: string): Promise<{ keywords: any[], cars: any[] }> {
    try {
      const response = await this.httpClient.get<any>(
        PRODUCT_ENDPOINTS.SEARCH_KEYWORDS,
        { params: { SearchTitle: searchTitle } }
      );
      
      const rawKeywords = response.data?.searchProductKeywords || [];
      const rawCars = response.data?.cars || [];
      
      // مپ کردن کلمات کلیدی
      const keywords = rawKeywords.map((dto: any) => ({
        suggestion: dto.searchKeywordSuggestion,
        productTitles: dto.productTitles || [],
        part: {
          id: dto.partId,
          name: dto.partName,
          englishTitle: dto.partEnglishTitle,
          href: `/search?partEnglishTitle=${dto.partEnglishTitle}`,
        },
        category: {
          id: dto.partCategoryId,
          name: dto.partCategoryName,
          englishTitle: dto.partCategoryEnglishTitle,
          href: `/categories/${dto.partCategoryEnglishTitle}`,
        },
        // اضافه کردن این فیلدها برای دسترسی در کامپوننت
        partCategoryId: dto.partCategoryId,
        partCategoryName: dto.partCategoryName,
        partCategoryEnglishTitle: dto.partCategoryEnglishTitle,
      }));

      // مپ کردن خودروها
      const cars = rawCars.map((dto: any) => ({
        id: dto.id,
        model: dto.model,
        englishTitle: dto.englishTitle,
        cover: dto.cover,
        coverAlt: dto.coverAlt,
      }));
      
      // بازگرداندن آبجکت شامل هر دو
      return { keywords, cars };
    } catch (error) {
      logger.error('[ProductService] Get search keywords failed:', error);
      return { keywords: [], cars: [] };
    }
  }
  // اصلاح نوع بازگشتی به آرایه‌ای جنریک برای تطابق با مدل واقعی { id, value, timestamp }
  async getSearchHistory(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(
        PRODUCT_ENDPOINTS.SEARCH_HISTORY
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('[ProductService] Get search history failed:', error);
      return [];
    }
  }

  async removeSearchHistory(searchTitle?: string): Promise<void> {
    try {
      await this.httpClient.delete(
        PRODUCT_ENDPOINTS.REMOVE_SEARCH_HISTORY,
        { params: { SearchTitle: searchTitle || '' } }
      );
    } catch (error) {
      logger.error('[ProductService] Remove search history failed:', error);
    }
  }
}

let productServiceInstance: ProductService | null = null;

export function getProductService(): ProductService {
  if (!productServiceInstance) {
    productServiceInstance = new ProductService();
  }
  return productServiceInstance;
}