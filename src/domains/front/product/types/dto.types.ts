// src/domains/front/product/types/dto.types.ts

export interface SearchProductKeywordItemApiDto {
  searchKeywordSuggestion: string;
  productTitles: string[];
  partId: string;
  partName: string;
  partEnglishTitle: string;
  partCategoryId: string;
  partCategoryName: string;
  partCategoryEnglishTitle: string;
}

export interface SearchProductKeywordsResponseApiDto {
  searchProductKeywords: SearchProductKeywordItemApiDto[];
}