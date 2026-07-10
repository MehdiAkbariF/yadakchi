// src/domains/front/basket/mappers/basket.mapper.ts

import { 
  BasketApiDto, 
  BasketItemApiDto,
  AddToBasketRequestDto,
  DeleteFromBasketRequestDto
} from '../types/dto.types';
import { 
  Basket, 
  BasketItem,
} from '../types/domain.types';
import { 
  BasketViewModel, 
  BasketItemViewModel,
  AddToBasketRequest,
  DeleteFromBasketRequest
} from '../types/view.types';

export class BasketMapper {
  static toDomain(dto: BasketApiDto): Basket {
    const items = dto.items.map(item => this.toDomainItem(item));
    
    return {
      id: dto.id,
      userId: dto.userId,
      items,
      total: {
        totalPrice: dto.totalPrice,
        totalDiscount: dto.totalDiscount,
        finalPrice: dto.finalPrice,
      },
      summary: {
        itemCount: dto.itemCount,
        shopCount: this.getShopCount(items),
        uniqueProductCount: this.getUniqueProductCount(items),
      },
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
    };
  }

  private static toDomainItem(dto: BasketItemApiDto): BasketItem {
    const price = {
      unitPrice: dto.price,
      discountPrice: dto.discountPrice,
      hasDiscount: dto.hasDiscount,
      discountPercent: dto.discountPercent,
      totalPrice: dto.price * dto.quantity,
      totalDiscount: dto.hasDiscount && dto.discountPrice 
        ? (dto.price - dto.discountPrice) * dto.quantity 
        : 0,
      finalPrice: dto.hasDiscount && dto.discountPrice
        ? dto.discountPrice * dto.quantity
        : dto.price * dto.quantity,
    };

    return {
      shopProductId: dto.shopProductId,
      product: {
        id: dto.productId,
        name: dto.productName,
        code: dto.productCode,
        image: dto.productImage,
      },
      shop: {
        id: dto.shopId,
        name: dto.shopName,
      },
      quantity: dto.quantity,
      price,
      inventory: {
        maxQuantity: dto.maxQuantity,
        isInStock: dto.isInStock,
      },
      type: dto.type.toUpperCase() as 'NEW' | 'STOCK' | 'TAKEOFF',
    };
  }

  static toView(domain: Basket): BasketViewModel {
    const items = domain.items.map(item => this.toViewItem(item));
    
    return {
      id: domain.id,
      items,
      total: {
        totalPrice: this.formatPrice(domain.total.totalPrice),
        totalDiscount: this.formatPrice(domain.total.totalDiscount),
        finalPrice: this.formatPrice(domain.total.finalPrice),
        totalPriceRaw: domain.total.totalPrice,
        totalDiscountRaw: domain.total.totalDiscount,
        finalPriceRaw: domain.total.finalPrice,
      },
      summary: domain.summary,
      isEmpty: domain.items.length === 0,
    };
  }

  private static toViewItem(item: BasketItem): BasketItemViewModel {
    const price = item.price;
    
    return {
      shopProductId: item.shopProductId,
      product: item.product,
      shop: item.shop,
      quantity: item.quantity,
      price: {
        unitPrice: this.formatPrice(price.unitPrice),
        discountPrice: price.discountPrice ? this.formatPrice(price.discountPrice) : null,
        hasDiscount: price.hasDiscount,
        discountPercent: price.discountPercent || null,
        totalPrice: this.formatPrice(price.totalPrice),
        totalDiscount: this.formatPrice(price.totalDiscount),
        finalPrice: this.formatPrice(price.finalPrice),
        unitPriceRaw: price.unitPrice,
        discountPriceRaw: price.discountPrice || null,
        totalPriceRaw: price.totalPrice,
        totalDiscountRaw: price.totalDiscount,
        finalPriceRaw: price.finalPrice,
      },
      inventory: {
        maxQuantity: item.inventory.maxQuantity,
        isInStock: item.inventory.isInStock,
        statusText: item.inventory.isInStock ? 'موجود' : 'ناموجود',
      },
      type: {
        value: item.type,
        label: item.type === 'NEW' ? 'جدید' : item.type === 'STOCK' ? 'موجود' : 'حراج',
        badge: item.type === 'NEW' ? 'success' : item.type === 'STOCK' ? 'info' : 'warning',
      },
      canIncrease: item.quantity < item.inventory.maxQuantity && item.inventory.isInStock,
      canDecrease: item.quantity > 1,
    };
  }

  static toAddRequest(request: AddToBasketRequest): AddToBasketRequestDto {
    return {
      shopProductId: request.shopProductId,
      quantity: request.quantity,
    };
  }

  static toDeleteRequest(request: DeleteFromBasketRequest): DeleteFromBasketRequestDto {
    return {
      shopProductId: request.shopProductId,
      quantity: request.quantity,
    };
  }

  private static getShopCount(items: BasketItem[]): number {
    const shopIds = new Set(items.map(item => item.shop.id));
    return shopIds.size;
  }

  private static getUniqueProductCount(items: BasketItem[]): number {
    const productIds = new Set(items.map(item => item.product.id));
    return productIds.size;
  }

  private static formatPrice(price: number): string {
    const toman = price / 10;
    return new Intl.NumberFormat('fa-IR').format(toman) + ' تومان';
  }
}