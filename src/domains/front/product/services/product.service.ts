// src/domains/front/product/services/product.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { PRODUCT_ENDPOINTS } from '../endpoints/product.endpoints';
import { ProductMapper } from '../mappers/product.mapper';
import { SearchProductsRequest, ProductViewModel, ProductPriceChartViewModel, ProductPageViewModel, PriceChartViewModel, CommentsAverageViewModel, CommentItemViewModel, InquiryItemViewModel } from '@/domains/front/product/types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';
import { ProductPageResponseDto, PriceChartDto, CommentsAverageDto, CommentsResponseDto, InquiriesResponseDto } from '../types/dto.types';

export class ProductService {
  private readonly httpClient = getHttpClient();

  async getNominatedProducts(cityId?: string): Promise<any> {
    try {
      const response = await this.httpClient.get<any>(
        PRODUCT_ENDPOINTS.SEARCH_NOMINATED,
        {
          params: {
            CityId: cityId || '',
            PageNumber: 1,
            PageSize: 30
          }
        }
      );
      return response.data;
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async getNominatedProductsByCategory(categoryEnglishTitle: string, cityId?: string): Promise<any> {
    try {
      const response = await this.httpClient.get<any>(
        PRODUCT_ENDPOINTS.SEARCH_NOMINATED,
        {
          params: {
            PartCategoryEnglishTitle: categoryEnglishTitle,
            CityId: cityId || '',
            PageNumber: 1,
            PageSize: 30
          }
        }
      );
      return response.data;
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  // ✅ متد جدید: دریافت محصولات چند دسته‌بندی با یک بار درخواست
  async getNominatedProductsByCategories(
    categoryEnglishTitles: string[], 
    cityId?: string
  ): Promise<Record<string, any>> {
    try {
      // ✅ اجرای موازی با حداکثر ۶ درخواست همزمان
      const results = await Promise.all(
        categoryEnglishTitles.map(title =>
          this.getNominatedProductsByCategory(title, cityId)
        )
      );

      // ✅ تبدیل به آبجکت
      return categoryEnglishTitles.reduce((acc, title, index) => {
        acc[title] = results[index];
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      logger.error('[ProductService] Get nominated products by categories failed:', error);
      return {};
    }
  }

  async searchProducts(request: SearchProductsRequest): Promise<PaginatedResult<ProductViewModel>> {
    try {
      const dto = ProductMapper.toDomainSearchRequest(request);
      
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
          href: `/part-category/${dto.partCategoryEnglishTitle}`,
        },
        partCategoryId: dto.partCategoryId,
        partCategoryName: dto.partCategoryName,
        partCategoryEnglishTitle: dto.partCategoryEnglishTitle,
      }));

      const cars = rawCars.map((dto: any) => ({
        id: dto.id,
        model: dto.model,
        englishTitle: dto.englishTitle,
        cover: dto.cover,
        coverAlt: dto.coverAlt,
      }));
      
      return { keywords, cars };
    } catch (error) {
      logger.error('[ProductService] Get search keywords failed:', error);
      return { keywords: [], cars: [] };
    }
  }

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

  async getProductPageData(productCode: number): Promise<ProductPageViewModel | null> {
    try {
      const response = await this.httpClient.get<ProductPageResponseDto>(
        PRODUCT_ENDPOINTS.GET_PRODUCT,
        { params: { ProductCode: productCode } }
      );
      if (!response.data || typeof response.data === 'string' || !response.data.product) {
        return null;
      }
      return ProductMapper.toViewProductPage(response.data);
    } catch (error) {
      logger.error('[ProductService] Get product page data failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getProductCommentsAverage(productId: string): Promise<CommentsAverageViewModel> {
    try {
      const response = await this.httpClient.get<CommentsAverageDto>(
        PRODUCT_ENDPOINTS.GET_COMMENTS_AVERAGE,
        { params: { Id: productId } }
      );
      return ProductMapper.toViewCommentsAverage(response.data);
    } catch (error) {
      logger.error('[ProductService] Get product comments average failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getProductComments(productId: string, orderBy: string = 'Newest', pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<CommentItemViewModel>> {
    try {
      const response = await this.httpClient.get<CommentsResponseDto>(
        PRODUCT_ENDPOINTS.GET_COMMENTS,
        {
          params: {
            ProductId: productId,
            OrderBy: orderBy,
            PageNumber: pageNumber,
            PageSize: pageSize
          }
        }
      );
      const items = (response.data.items || []).map(dto => ProductMapper.toViewCommentItem(dto));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[ProductService] Get product comments failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getProductInquiries(productId: string, orderBy: string = 'Latest', pageNumber: number = 1, pageSize: number = 30): Promise<PaginatedResult<InquiryItemViewModel>> {
    try {
      const response = await this.httpClient.get<InquiriesResponseDto>(
        PRODUCT_ENDPOINTS.GET_INQUIRIES,
        {
          params: {
            ProductId: productId,
            OrderBy: orderBy,
            PageNumber: pageNumber,
            PageSize: pageSize
          }
        }
      );
      const items = (response.data.items || []).map(dto => ProductMapper.toViewInquiryItem(dto));
      return {
        items,
        pageNumber: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.currentPage < response.data.totalPages,
        hasPreviousPage: response.data.currentPage > 1,
        hasMore: response.data.currentPage < response.data.totalPages,
        from: (response.data.currentPage - 1) * response.data.pageSize + 1,
        to: Math.min(response.data.currentPage * response.data.pageSize, response.data.totalCount)
      };
    } catch (error) {
      logger.error('[ProductService] Get product inquiries failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async isUserFavoriteProduct(productCode: number): Promise<boolean> {
    try {
      const response = await this.httpClient.get<any>(
        PRODUCT_ENDPOINTS.IS_FAVORITE,
        { 
          params: { 
            productCode,
            _t: Date.now()
          } 
        }
      );

      const result = response.data;

      if (result === true || result === 'true') return true;
      if (result === false || result === 'false') return false;

      if (result && typeof result === 'object') {
        const dataValue = (result as any).data;
        if (dataValue === true || dataValue === 'true') return true;
      }

      return false;
    } catch (error) {
      logger.error('[ProductService] Check favorite failed:', error);
      return false;
    }
  }

  async addFavorite(productId: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('ProductId', productId);

      await this.httpClient.post(PRODUCT_ENDPOINTS.POST_FAVORITE, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error) {
      logger.error('[ProductService] Add favorite failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async deleteFavorite(productId: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('ProductId', productId);

      await this.httpClient.delete(PRODUCT_ENDPOINTS.DELETE_FAVORITE, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error) {
      logger.error('[ProductService] Delete favorite failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async submitProductReport(productId: string, reportSubjectId: string, description: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('ProductId', productId);
      formData.append('ReportSubjectId', reportSubjectId);
      formData.append('Description', description);
      await this.httpClient.post('/api/Front/ProductReport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      logger.error('[ProductService] Submit product report failed:', error);
      throw errorManager.normalize(error);
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