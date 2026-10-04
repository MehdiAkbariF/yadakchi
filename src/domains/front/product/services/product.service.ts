// src/domains/front/product/services/product.service.ts

import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { PRODUCT_ENDPOINTS } from '../endpoints/product.endpoints';
import { ProductMapper } from '../mappers/product.mapper';
import { 
  SearchProductsRequest, 
  ProductViewModel, 
  ProductPriceChartViewModel, 
  ProductPageViewModel, 
  PriceChartViewModel, 
  CommentsAverageViewModel, 
  CommentItemViewModel, 
  InquiryItemViewModel 
} from '@/domains/front/product/types/view.types';
import { PaginatedResult } from '@/shared/types/common.types';
import { 
  ProductPageResponseDto, 
  PriceChartDto, 
  CommentsAverageDto, 
  CommentsResponseDto, 
  InquiriesResponseDto, 
  OpenSearchProductsResponseDto, 
  OpenSearchProductsRequestDto
} from '../types/dto.types';

// ============================================
// ماژول مبدل خودکار اسلاگ دسته‌بندی به GUID
// ============================================
let categorySlugToGuidMap: Map<string, string> | null = null;
let categoryLookupPromise: Promise<Map<string, string>> | null = null;

async function resolveCategoryGuid(httpClient: any, identifier: string): Promise<string> {
  if (!identifier) return '';

  // اگر شناسه وارد شده از قبل یک GUID معتبر است
  const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);
  if (isGuid) {
    return identifier;
  }

  const cleanSlug = identifier.trim().toLowerCase();

  // اگر نقشه قبلاً در حافظه ایجاد شده بود
  if (categorySlugToGuidMap && categorySlugToGuidMap.has(cleanSlug)) {
    return categorySlugToGuidMap.get(cleanSlug) || identifier;
  }

  // واکشی لیست دسته‌بندی‌ها و کش کردن در حافظه (فقط یک‌بار)
  if (!categoryLookupPromise) {
    categoryLookupPromise = (async () => {
      try {
        const response = await httpClient.get('/api/Front/PartCategories', {
          params: { CarId: '' }
        });
        const categories = Array.isArray(response.data) ? response.data : [];
        const map = new Map<string, string>();

        function traverse(items: any[]) {
          items.forEach(cat => {
            if (cat.englishTitle && cat.id) {
              map.set(cat.englishTitle.trim().toLowerCase(), cat.id);
            }
            if (cat.name && cat.id) {
              map.set(cat.name.trim().toLowerCase(), cat.id);
            }
            if (cat.children && Array.isArray(cat.children)) {
              traverse(cat.children);
            }
          });
        }

        traverse(categories);
        categorySlugToGuidMap = map;
        return map;
      } catch (err) {
        logger.error('[ProductService] Failed to load categories for GUID resolution:', err);
        return new Map<string, string>();
      } finally {
        categoryLookupPromise = null;
      }
    })();
  }

  const map = await categoryLookupPromise;
  return map.get(cleanSlug) || identifier;
}

export class ProductService {
  private readonly httpClient = getHttpClient();

  async getNominatedProducts(cityId?: string): Promise<any> {
    try {
      const payload: OpenSearchProductsRequestDto = {
        onlyInStock: true,
        pageNumber: 1,
        pageSize: 30,
        includeAggregations: false,
      };

      const response = await this.httpClient.post<OpenSearchProductsResponseDto>(
        PRODUCT_ENDPOINTS.SEARCH_NOMINATED,
        payload
      );

      const hits = response.data?.hits || [];
      return {
        products: {
          items: hits,
          totalCount: response.data?.total || hits.length,
          currentPage: response.data?.pageNumber || 1,
          pageSize: response.data?.pageSize || 30,
        }
      };
    } catch (error) {
      logger.error('[ProductService] Get nominated products failed:', error);
      throw errorManager.normalize(error);
    }
  }

  // ✅ متد ارتقایافته: حل خودکار اسلاگ (مثلاً audio-video-multimedia-system) به GUID معتبر
  async getNominatedProductsByCategory(categoryIdOrSlug: string, cityId?: string): Promise<any> {
    try {
      const resolvedId = await resolveCategoryGuid(this.httpClient, categoryIdOrSlug);

      const payload: OpenSearchProductsRequestDto = {
        partCategoryIds: resolvedId ? [resolvedId] : undefined,
        onlyInStock: true,
        pageNumber: 1,
        pageSize: 30,
        includeAggregations: false,
      };

      const response = await this.httpClient.post<OpenSearchProductsResponseDto>(
        PRODUCT_ENDPOINTS.SEARCH_NOMINATED,
        payload
      );

      const hits = response.data?.hits || [];
      return {
        products: {
          items: hits,
          totalCount: response.data?.total || hits.length,
          currentPage: response.data?.pageNumber || 1,
          pageSize: response.data?.pageSize || 30,
        }
      };
    } catch (error) {
      logger.error('[ProductService] Get nominated products by category failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getNominatedProductsByCategories(
    categoryIdsOrSlugs: string[], 
    cityId?: string
  ): Promise<Record<string, any>> {
    try {
      const results = await Promise.all(
        categoryIdsOrSlugs.map(id =>
          this.getNominatedProductsByCategory(id, cityId)
        )
      );

      return categoryIdsOrSlugs.reduce((acc, key, index) => {
        acc[key] = results[index];
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      logger.error('[ProductService] Get nominated products by categories failed:', error);
      return {};
    }
  }

  // ✅ جستجوی پیشرفته با حل خودکار دسته‌بندی‌ها به GUID
  async searchProducts(request: SearchProductsRequest): Promise<PaginatedResult<ProductViewModel>> {
    try {
      // اگر در درخواست partCategoryEnglishTitle وجود داشت ولی partCategoryIds خالی بود، خودکار به GUID تبدیل شود
      if (request.partCategoryEnglishTitle && (!request.partCategoryIds || request.partCategoryIds.length === 0)) {
        const resolved = await resolveCategoryGuid(this.httpClient, request.partCategoryEnglishTitle);
        if (resolved) {
          request.partCategoryIds = [resolved];
        }
      }

      const payload = ProductMapper.toOpenSearchRequest(request);

      const response = await this.httpClient.post<OpenSearchProductsResponseDto>(
        PRODUCT_ENDPOINTS.SEARCH_PRODUCTS,
        payload
      );

      const data = response.data;
      const rawHits = data?.hits || (data as any)?.products?.items || (data as any)?.items || [];
      const totalCount = data?.total ?? (data as any)?.totalCount ?? (data as any)?.products?.totalCount ?? 0;
      const pageNumber = data?.pageNumber ?? (data as any)?.currentPage ?? request.pageNumber ?? 1;
      const pageSize = data?.pageSize ?? (data as any)?.pageSize ?? request.pageSize ?? 30;
      const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;

      if (!rawHits || rawHits.length === 0) {
        return {
          items: [],
          pageNumber,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: false,
          hasPreviousPage: false,
          hasMore: false,
          from: 0,
          to: 0,
        };
      }

      const items = rawHits.map((item: any) => {
        const domain = ProductMapper.toDomain(item);
        return ProductMapper.toView(domain);
      });

      return {
        items,
        pageNumber,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
        hasMore: pageNumber < totalPages,
        from: (pageNumber - 1) * pageSize + 1,
        to: Math.min(pageNumber * pageSize, totalCount),
      };
    } catch (error) {
      logger.error('[ProductService] Search products via OpenSearch failed:', error);
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