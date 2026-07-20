import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { SearchProductsRequest } from '../types/view.types';

export class SearchProductsValidator extends BaseValidator<SearchProductsRequest> {
  public getSchema(): z.ZodSchema<SearchProductsRequest> {
    return z.object({
      searchTitle: z.string().optional(),
      isProductInStock: z.boolean().optional(),
      isSellerInUserCity: z.boolean().optional(),
      types: z.array(z.enum(['New', 'Stock', 'TakeOff'])).optional(),
      partCategoryIds: z.array(z.string()).optional(),
      partCategoryEnglishTitle: z.string().optional(),
      partEnglishTitle: z.string().optional(),
      carModel: z.string().optional(),
      carIds: z.array(z.string()).optional(),
      partIds: z.array(z.string()).optional(),
      brandIds: z.array(z.string()).optional(),
      shopId: z.string().optional(),
      cityId: z.string().optional(),
      hasDiscount: z.boolean().optional(),
      hasDiscountWithExpiration: z.boolean().optional(),
      fromPrice: z.number().int().positive().optional(),
      toPrice: z.number().int().positive().optional(),
      orderType: z.enum([
        'Selected', 'MostVisited', 'Newest', 
        'BestSelling', 'Cheapest', 'MostExpensive', 
        'HighestRated'
      ]).optional(),
      productDetails: z.string().optional(),
      productCode: z.number().int().positive().optional(),
      samePartByProductCode: z.number().int().positive().optional(),
      pageNumber: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(30),
    });
  }
}

export class ProductDetailRequestValidator extends BaseValidator<{ productCode: number }> {
  public getSchema(): z.ZodSchema<{ productCode: number }> {
    return z.object({
      productCode: z.number().int().positive('کد کالا باید عدد مثبت معتبر باشد')
    });
  }
}

export class FavoriteRequestValidator extends BaseValidator<{ productId: string }> {
  public getSchema(): z.ZodSchema<{ productId: string }> {
    return z.object({
      productId: z.string().uuid('شناسه محصول باید یک UUID معتبر باشد')
    });
  }
}

export const productValidators = {
  search: new SearchProductsValidator(),
  details: new ProductDetailRequestValidator(),
  favorite: new FavoriteRequestValidator()
} as const;