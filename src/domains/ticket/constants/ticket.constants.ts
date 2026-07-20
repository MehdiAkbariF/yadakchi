export const TICKET_CONSTANTS = {
  STATUS: {
    WaitingForAnswer: 'در انتظار پاسخ پشتیبانی',
    Answered: 'پاسخ داده شده',
    Closed: 'بسته شده',
  } as const,

  STATUS_COLORS: {
    WaitingForAnswer: 'warning' as const,
    Answered: 'success' as const,
    Closed: 'secondary' as const,
  } as const,

  CATEGORIES_TYPES: {
    User: 'User',
    Seller: 'Seller',
    ReturnRequest: 'ReturnRequest',
    DamageReport: 'DamageReport',
  } as const,

  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
} as const;