export const BASKET_ENDPOINTS = {
  GET_BASKET: '/api/Front/GetFrontBasket',
  ADD_TO_BASKET: '/api/Front/AddToBasket',
  DELETE_FROM_BASKET: '/api/Front/DeleteFromBasket',
  GET_LOCATIONS: '/api/UserPanel/UserLocations',
  POST_LOCATION: '/api/UserPanel/UserLocation',
  PUT_LOCATION: '/api/UserPanel/UserLocation',
  DELETE_LOCATION: '/api/UserPanel/UserLocation',
  CHECKOUT_BASKET: '/api/UserPanel/CheckoutBasket',
  CHANGE_LOCATION: '/api/UserPanel/ChangeBasketLocation',
  BASKET_SHIPMENT: '/api/UserPanel/BasketShipment',
  BASKET_PAYMENT: '/api/UserPanel/BasketPayment',
  CALLBACK_URL: '/api/UserPanel/CallBackUrl',
} as const;