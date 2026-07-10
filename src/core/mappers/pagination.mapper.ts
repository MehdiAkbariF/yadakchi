// src/core/mappers/pagination.mapper.ts

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  hasMore: boolean;
  from: number;
  to: number;
}

export interface PaginatedResponseApiDto<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginationMapper {
  static toDomain<TDomain, TApi>(
    apiDto: PaginatedResponseApiDto<TApi>,
    itemMapper: (item: TApi) => TDomain
  ): PaginatedResult<TDomain> {
    const items = apiDto.items.map(itemMapper);
    
    return {
      items,
      pageNumber: apiDto.pageNumber,
      pageSize: apiDto.pageSize,
      totalCount: apiDto.totalCount,
      totalPages: apiDto.totalPages,
      hasNextPage: apiDto.hasNextPage,
      hasPreviousPage: apiDto.hasPreviousPage,
      hasMore: apiDto.hasNextPage,
      from: (apiDto.pageNumber - 1) * apiDto.pageSize + 1,
      to: Math.min(apiDto.pageNumber * apiDto.pageSize, apiDto.totalCount),
    };
  }

  static toView<TView, TDomain>(
    paginated: PaginatedResult<TDomain>,
    viewMapper: (domain: TDomain) => TView
  ): PaginatedResult<TView> {
    return {
      ...paginated,
      items: paginated.items.map(viewMapper),
    };
  }
}