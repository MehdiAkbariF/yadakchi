// src/lib/react-query/query-keys.ts (به‌روزرسانی نهایی)

export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },

  // Front
  front: {
    // Products
    products: {
      all: ['front', 'products'] as const,
      details: (productCode: number) => ['front', 'products', 'details', productCode] as const,
      search: (params: any) => ['front', 'products', 'search', params] as const,
    },

    // Shops
    shops: {
      details: (shopId: string) => ['front', 'shops', 'details', shopId] as const,
      cards: (params: any) => ['front', 'shops', 'cards', params] as const,
      best: ['front', 'shops', 'best'] as const,
    },

    // Basket
    basket: {
      current: ['front', 'basket', 'current'] as const,
    },

    // Comments
    comments: {
      product: (productId: string, params: any) => 
        ['front', 'comments', 'product', productId, params] as const,
      replies: (commentId: string, params: any) => 
        ['front', 'comments', 'replies', commentId, params] as const,
    },

    // Inquiries
    inquiries: {
      product: (productId: string, params: any) => 
        ['front', 'inquiries', 'product', productId, params] as const,
      replies: (inquiryId: string, params: any) => 
        ['front', 'inquiries', 'replies', inquiryId, params] as const,
    },

    // Parts
    parts: {
      list: (params: any) => ['front', 'parts', 'list', params] as const,
      page: (englishName: string, carModel?: string) => 
        ['front', 'parts', 'page', englishName, carModel] as const,
      categories: (carId?: string) => ['front', 'parts', 'categories', carId] as const,
    },

    // Banners
    banners: {
      list: (pageName: string) => ['front', 'banners', pageName] as const,
      shopProduct: (params: any) => ['front', 'banners', 'shop-product', params] as const,
    },

    // Static
    static: {
      page: (title: string) => ['front', 'static', 'page', title] as const,
      faq: (params: any) => ['front', 'static', 'faq', params] as const,
    },

    // Reference
    reference: {
      cars: {
        list: (params: any) => ['front', 'reference', 'cars', 'list', params] as const,
        names: (params: any) => ['front', 'reference', 'cars', 'names', params] as const,
        manufacturers: (params: any) => ['front', 'reference', 'cars', 'manufacturers', params] as const,
      },
      brands: {
        list: (params: any) => ['front', 'reference', 'brands', 'list', params] as const,
        main: ['front', 'reference', 'brands', 'main'] as const,
      },
      cities: {
        list: (params: any) => ['front', 'reference', 'cities', 'list', params] as const,
        province: (provinceId: string) => ['front', 'reference', 'cities', 'province', provinceId] as const,
      },
      provinces: {
        list: (params: any) => ['front', 'reference', 'provinces', 'list', params] as const,
      },
    },

    // Shared
    megaMenu: ['front', 'mega-menu'] as const,
    footer: ['front', 'footer'] as const,
  },

  // User
  user: {
    profile: ['user', 'profile'] as const,
    orders: {
      list: (params: any) => ['user', 'orders', 'list', params] as const,
      details: (orderId: string) => ['user', 'orders', 'details', orderId] as const,
    },
    favorites: {
      list: (params: any) => ['user', 'favorites', 'list', params] as const,
    },
    notifications: {
      list: (params: any) => ['user', 'notifications', 'list', params] as const,
    },
    wallet: {
      balance: ['user', 'wallet', 'balance'] as const,
      transactions: (params: any) => ['user', 'wallet', 'transactions', params] as const,
    },
  },
} as const;