export const USERPANEL_CONSTANTS = {
  ORDER_STATUS: {
    WaitingForPayment: 'در انتظار پرداخت',
    InProgress: 'جاری',
    Delivered: 'تحویل شده',
    ReturnRequest: 'مرجوع شده',
    Cancelled: 'لغو شده',
  } as const,
  
  TRANSACTION_TYPES: {
    OrderDeposit: 'پرداخت سفارش',
    Refund: 'مرجوعی سفارش',
    Withdraw: 'برداشت از حساب',
    SystemDeposit: 'واریز سیستمی',
  } as const,

  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,
} as const;