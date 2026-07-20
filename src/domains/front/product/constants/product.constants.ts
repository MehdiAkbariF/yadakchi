export const PRODUCT_CONSTANTS = {
  TYPES: {
    NEW: 'New',
    STOCK: 'Stock',
    TAKEOFF: 'TakeOff',
  } as const,
  
  ORDER_TYPES: {
    SELECTED: 'Selected',
    MOST_VISITED: 'MostVisited',
    NEWEST: 'Newest',
    BEST_SELLING: 'BestSelling',
    CHEAPEST: 'Cheapest',
    MOST_EXPENSIVE: 'MostExpensive',
    HIGHEST_RATED: 'HighestRated',
  } as const,
  
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
  
  CACHE_TIMES: {
    SEARCH: 60,
    DETAILS: 300,
    RELATED: 300,
    PRICE_CHART: 600,
  } as const,
} as const;