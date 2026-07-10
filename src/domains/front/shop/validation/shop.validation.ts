// src/domains/front/shop/validation/shop.validation.ts

import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { ShopFilters, ShopReportRequest } from '../types/view.types';

export class ShopFiltersValidator extends BaseValidator<ShopFilters> {
  protected getSchema(): z.ZodSchema<ShopFilters> {
    return z.object({
      orderBy: z.enum(['Rating', 'Rank', 'Oldest']).optional(),
      carManufacturerIds: z.array(z.string()).optional(),
      carIds: z.array(z.string()).optional(),
      partIds: z.array(z.string()).optional(),
      pageNumber: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(30),
    });
  }
}

export class ShopReportValidator extends BaseValidator<ShopReportRequest> {
  protected getSchema(): z.ZodSchema<ShopReportRequest> {
    return z.object({
      shopId: z.string().min(1, 'شناسه فروشگاه الزامی است'),
      shopProductId: z.string().optional(),
      description: z.string()
        .min(10, 'توضیحات حداقل ۱۰ کاراکتر باید باشد')
        .max(500, 'توضیحات حداکثر ۵۰۰ کاراکتر باید باشد'),
      reportSubjectId: z.string().min(1, 'موضوع گزارش الزامی است'),
    });
  }
}

export const shopValidators = {
  filters: new ShopFiltersValidator(),
  report: new ShopReportValidator(),
} as const;