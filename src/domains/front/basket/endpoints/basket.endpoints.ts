// src/domains/front/basket/endpoints/basket.endpoints.ts

export const BASKET_ENDPOINTS = {
  GET_BASKET: '/api/Front/GetFrontBasket',
  ADD_TO_BASKET: '/api/Front/AddToBasket',
  DELETE_FROM_BASKET: '/api/Front/DeleteFromBasket',
  GET_LOCATIONS: '/api/UserPanel/UserLocations',
  POST_LOCATION: '/api/UserPanel/UserLocation',
  PUT_LOCATION: '/api/UserPanel/UserLocation',
  DELETE_LOCATION: '/api/UserPanel/UserLocation',
  CHECKOUT_BASKET: '/api/UserPanel/CheckoutBasket',
  BASKET_SHIPMENT_PRICE: '/api/UserPanel/BasketShipmentPrice',
  BASKET_SHIPMENT: '/api/UserPanel/BasketShipment',
  BASKET_PAYMENT: '/api/UserPanel/BasketPayment',
  APPLY_DISCOUNT: '/api/UserPanel/ApplyDiscountCodeToBasket',
  APPLY_REFERRAL: '/api/UserPanel/ApplyReferalCodeToBasket',
  GET_DISCOUNT_CODES: '/api/UserPanel/GetDiscountCodes',
  CALLBACK_URL: '/api/UserPanel/CallBackUrl',
} as const;