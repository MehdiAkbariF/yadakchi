// src/lib/react-query/query-keys.ts

// Base query keys - will be expanded as domains are added
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // Front (Public)
  front: {
    // Will be expanded
   products: {
      all: ['front', 'products'] as const,
      details: (productCode: number) => ['front', 'products', 'details', productCode] as const,
      search: (params: any) => ['front', 'products', 'search', params] as const,
    },
 basket: {
      current: ['front', 'basket', 'current'] as const,
    },
  },
  
  // User (Private)
  user: {
    // Will be expanded
    profile: ['user', 'profile'] as const,
    orders: {
      list: (params: any) => ['user', 'orders', 'list', params] as const,
      details: (orderId: string) => ['user', 'orders', 'details', orderId] as const,
    },
  },
} as const;