// src/domains/front/part/validation/part.validation.ts

import { z } from 'zod';
import { BaseValidator } from '@/core/validation/base.validator';
import { PartFilters, PartCategoryFilters } from '../types/view.types';

export class PartFiltersValidator extends BaseValidator<PartFilters> {
  protected getSchema(): z.ZodSchema<PartFilters> {
    return z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      englishTitle: z.string().optional(),
      partCategoryEnglishTitle: z.string().optional(),
      partCategoryId: z.string().optional(),
      carModel: z.string().optional(),
      pageNumber: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(30),
    });
  }
}

export class PartCategoryFiltersValidator extends BaseValidator<PartCategoryFilters> {
  protected getSchema(): z.ZodSchema<PartCategoryFilters> {
    return z.object({
      name: z.string().optional(),
      englishTitle: z.string().optional(),
      id: z.string().optional(),
      description: z.string().optional(),
      hasSeo: z.boolean().optional(),
      hasDescription: z.boolean().optional(),
      partCategoryId: z.string().optional(),
      isActive: z.boolean().optional(),
      isDeleted: z.boolean().optional(),
      pageNumber: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(30),
    });
  }
}

export const partValidators = {
  filters: new PartFiltersValidator(),
  categoryFilters: new PartCategoryFiltersValidator(),
} as const;