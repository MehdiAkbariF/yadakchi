// src/domains/front/product/services/product.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { PRODUCT_ENDPOINTS } from '../endpoints/product.endpoints';
import { ProductMapper } from '../mappers/product.mapper';
import { SearchProductsRequest } from '../types/view.types';
import { ProductApiDto, PaginatedResponseDto, ProductPriceChartApiDto } from '../types/dto.types';
import { ProductViewModel, ProductPriceChartViewModel } from '../types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';

export class ProductService {
  private readonly httpClient = getHttpClient();

  async searchProducts(request: SearchProductsRequest): Promise<PaginatedResult<ProductViewModel>> {
    try {
      const dto = ProductMapper.toDomainSearchRequest(request);
      
      const response = await this.httpClient.get<PaginatedResponseDto<ProductApiDto>>(
        PRODUCT_ENDPOINTS.SEARCH_PRODUCTS,
        { params: dto as Record<string, unknown> }
      );

      const items = response.data.items.map(item => {
        const domain = ProductMapper.toDomain(item);
        return ProductMapper.toView(domain);
      });

      return {
        items,
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
        hasMore: response.data.hasNextPage,
        from: (response.data.pageNumber - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.pageNumber * response.data.pageSize, response.data.totalCount),
      };
    } catch (error) {
      logger.error('[ProductService] Search products failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getProductDetails(productCode: number): Promise<ProductViewModel> {
    try {
      const response = await this.httpClient.get<ProductApiDto>(
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
      const response = await this.httpClient.get<ProductApiDto[]>(
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
      const response = await this.httpClient.get<ProductPriceChartApiDto>(
        PRODUCT_ENDPOINTS.GET_PRICE_CHART,
        { params: { ProductId: productId, ShopProductType: shopProductType } }
      );

      return ProductMapper.toViewPriceChart(response.data);
    } catch (error) {
      logger.error('[ProductService] Get price chart failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async isUserFavorite(productCode: number): Promise<boolean> {
    try {
      const response = await this.httpClient.get<{ isFavorite: boolean }>(
        PRODUCT_ENDPOINTS.IS_FAVORITE,
        { params: { productCode } }
      );
      return response.data.isFavorite;
    } catch (error) {
      logger.error('[ProductService] Check favorite failed:', error);
      return false;
    }
  }

  async getSearchSuggestions(searchTitle: string): Promise<string[]> {
    try {
      const response = await this.httpClient.get<{ suggestions: string[] }>(
        PRODUCT_ENDPOINTS.SEARCH_SUGGESTIONS,
        { params: { SearchTitle: searchTitle } }
      );
      return response.data.suggestions || [];
    } catch (error) {
      logger.error('[ProductService] Get search suggestions failed:', error);
      return [];
    }
  }

  async getSearchKeywords(searchTitle: string): Promise<string[]> {
    try {
      const response = await this.httpClient.get<{ keywords: string[] }>(
        PRODUCT_ENDPOINTS.SEARCH_KEYWORDS,
        { params: { SearchTitle: searchTitle } }
      );
      return response.data.keywords || [];
    } catch (error) {
      logger.error('[ProductService] Get search keywords failed:', error);
      return [];
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