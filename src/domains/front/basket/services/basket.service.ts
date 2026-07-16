import { getHttpClient } from '@/core/http/client';
import { errorManager } from '@/core/errors/error-manager';
import { logger } from '@/core/utils/logger';
import { BASKET_ENDPOINTS } from '../endpoints/basket.endpoints';
import { BasketMapper } from '../mappers/basket.mapper';
import { BasketApiDto } from '../types/dto.types';
import { BasketViewModel } from '../types/view.types';
import { AddToBasketRequest, DeleteFromBasketRequest } from '../types/view.types';

export class BasketService {
  private readonly httpClient = getHttpClient();

  async getBasket(): Promise<BasketViewModel> {
    try {
      logger.debug('[BasketService] Getting basket');
      const response = await this.httpClient.get<BasketApiDto>(
        BASKET_ENDPOINTS.GET_BASKET
      );
      const domain = BasketMapper.toDomain(response.data);
      return BasketMapper.toView(domain);
    } catch (error) {
      logger.error('[BasketService] Get basket failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async addToBasket(request: AddToBasketRequest): Promise<BasketViewModel> {
    try {
      logger.debug('[BasketService] Adding to basket:', request);
      const dto = BasketMapper.toAddRequest(request);
      const response = await this.httpClient.post<BasketApiDto>(
        BASKET_ENDPOINTS.ADD_TO_BASKET,
        dto
      );
      const domain = BasketMapper.toDomain(response.data);
      return BasketMapper.toView(domain);
    } catch (error) {
      logger.error('[BasketService] Add to basket failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async deleteFromBasket(request: DeleteFromBasketRequest): Promise<BasketViewModel> {
    try {
      logger.debug('[BasketService] Deleting from basket:', request);
      const dto = BasketMapper.toDeleteRequest(request);
      const response = await this.httpClient.delete<BasketApiDto>(
        BASKET_ENDPOINTS.DELETE_FROM_BASKET,
        dto
      );
      const domain = BasketMapper.toDomain(response.data);
      return BasketMapper.toView(domain);
    } catch (error) {
      logger.error('[BasketService] Delete from basket failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async clearBasket(): Promise<BasketViewModel> {
    try {
      logger.debug('[BasketService] Clearing basket');
      const currentBasket = await this.getBasket();
      const itemsToDelete: any[] = [];
      if ((currentBasket as any).subBaskets) {
        (currentBasket as any).subBaskets.forEach((sb: any) => {
          if (sb.items) {
            itemsToDelete.push(...sb.items);
          }
        });
      }
      for (const item of itemsToDelete) {
        await this.deleteFromBasket({
          shopProductId: item.shopProductId,
          quantity: item.quantity,
        });
      }
      return await this.getBasket();
    } catch (error) {
      logger.error('[BasketService] Clear basket failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async updateQuantity(shopProductId: string, quantity: number): Promise<BasketViewModel> {
    try {
      logger.debug('[BasketService] Updating quantity:', { shopProductId, quantity });
      const basket = await this.getBasket();
      let item: any = null;
      if ((basket as any).subBaskets) {
        for (const sub of (basket as any).subBaskets) {
          if (sub.items) {
            const found = sub.items.find((i: any) => i.shopProductId === shopProductId);
            if (found) {
              item = found;
              break;
            }
          }
        }
      }
      if (!item) {
        throw new Error('Item not found in basket');
      }
      if (quantity > item.quantity) {
        return await this.addToBasket({
          shopProductId,
          quantity: quantity - item.quantity,
        });
      } else if (quantity < item.quantity) {
        return await this.deleteFromBasket({
          shopProductId,
          quantity: item.quantity - quantity,
        });
      }
      return basket;
    } catch (error) {
      logger.error('[BasketService] Update quantity failed:', error);
      throw errorManager.normalize(error);
    }
  }

  async getUserLocations(): Promise<any[]> {
    try {
      const response = await this.httpClient.get<any[]>(BASKET_ENDPOINTS.GET_LOCATIONS);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async createUserLocation(formData: FormData): Promise<void> {
    try {
      await this.httpClient.post(BASKET_ENDPOINTS.POST_LOCATION, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async updateUserLocation(formData: FormData): Promise<void> {
    try {
      await this.httpClient.put(BASKET_ENDPOINTS.PUT_LOCATION, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async deleteUserLocation(id: string): Promise<void> {
    try {
      await this.httpClient.delete(BASKET_ENDPOINTS.DELETE_LOCATION, { id });
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async getCheckoutBasket(): Promise<any> {
    try {
      const response = await this.httpClient.post(BASKET_ENDPOINTS.CHECKOUT_BASKET);
      return response.data;
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async changeBasketLocation(locationId: string): Promise<void> {
    try {
      await this.httpClient.post(BASKET_ENDPOINTS.CHANGE_LOCATION, { locationId });
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async setBasketShipment(locationId: string, methods: any[]): Promise<void> {
    try {
      await this.httpClient.post(BASKET_ENDPOINTS.BASKET_SHIPMENT, { locationId, methods });
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async initiatePayment(isLegalReceipt: boolean): Promise<any> {
    try {
      const response = await this.httpClient.post(BASKET_ENDPOINTS.BASKET_PAYMENT, { isLegalReceipt });
      return response.data;
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async applyDiscountCode(code: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('DiscountCode', code);
      const response = await this.httpClient.put(
        '/api/UserPanel/ApplyDiscountCodeToBasket',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async applyReferralCode(code: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('ReferralCode', code);
      const response = await this.httpClient.post(
        '/api/UserPanel/ApplyReferalCodeToBasket',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }

  async checkoutBasket(): Promise<any> {
    try {
      const response = await this.httpClient.post(BASKET_ENDPOINTS.CHECKOUT_BASKET);
      return response.data;
    } catch (error) {
      throw errorManager.normalize(error);
    }
  }
}

let basketServiceInstance: BasketService | null = null;

export function getBasketService(): BasketService {
  if (!basketServiceInstance) {
    basketServiceInstance = new BasketService();
  }
  return basketServiceInstance;
}