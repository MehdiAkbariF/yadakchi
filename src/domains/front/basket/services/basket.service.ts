// src/domains/front/basket/services/basket.service.ts

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
      
      // برای DELETE با body، از روش زیر استفاده می‌کنیم
      const response = await this.httpClient.delete<BasketApiDto>(
        BASKET_ENDPOINTS.DELETE_FROM_BASKET,
        {
          params: {
            shopProductId: dto.shopProductId,
            quantity: dto.quantity,
          }
        }
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
      
      // Get current basket and remove all items
      const currentBasket = await this.getBasket();
      
      for (const item of currentBasket.items) {
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
      
      // Get current basket
      const basket = await this.getBasket();
      const item = basket.items.find(i => i.shopProductId === shopProductId);
      
      if (!item) {
        throw new Error('Item not found in basket');
      }
      
      if (quantity > item.quantity) {
        // Add more
        return await this.addToBasket({
          shopProductId,
          quantity: quantity - item.quantity,
        });
      } else if (quantity < item.quantity) {
        // Remove some
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
}

let basketServiceInstance: BasketService | null = null;

export function getBasketService(): BasketService {
  if (!basketServiceInstance) {
    basketServiceInstance = new BasketService();
  }
  return basketServiceInstance;
}