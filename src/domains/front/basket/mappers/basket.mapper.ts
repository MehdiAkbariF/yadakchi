import { 
  AddToBasketRequestDto,
  DeleteFromBasketRequestDto
} from '../types/dto.types';

import { 
  AddToBasketRequest,
  DeleteFromBasketRequest
} from '../types/view.types';

export class BasketMapper {
  static toDomain(dto: any): any {
    const subBaskets = (dto.subBaskets || []).map((sb: any) => ({
      id: sb.id,
      shop: {
        title: sb.shop?.shopTitle || '',
        logo: sb.shop?.logo || '',
      },
      items: (sb.subBasketItems || []).map((item: any) => {
        const sp = item.shopProduct || {};
        const prod = sp.product || {};
        return {
          id: item.id,
          shopProductId: sp.id,
          quantity: item.quantity,
          originalPrice: item.originalPrice,
          discountAmount: item.discountAmount,
          finalUnitPrice: item.finalUnitPrice,
          finalTotalPrice: item.finalTotalPrice,
          warranty: sp.warrantySupport?.title || '',
          maxQuantity: sp.maxQuantityPerOrder || sp.quantity || 10,
          partNumber: sp.partNumber || '',
          type: sp.type || 'New',
          dayOfDelivery: sp.dayOfDelivery || 1,
          isTipaxShipping: !!sp.isTipaxShipping,
          isDirectShipping: !!sp.isDirectShipping,
          product: {
            code: prod.productCode,
            title: prod.title,
            image: prod.image,
          }
        };
      })
    }));

    let totalPrice = 0;
    let totalDiscount = 0;
    let finalPrice = 0;

    subBaskets.forEach((sb: any) => {
      sb.items.forEach((item: any) => {
        totalPrice += item.originalPrice * item.quantity;
        totalDiscount += item.discountAmount * item.quantity;
        finalPrice += item.finalTotalPrice;
      });
    });

    return {
      id: dto.id,
      userLocationId: dto.userLocationId,
      subBaskets,
      total: {
        totalPrice,
        totalDiscount,
        finalPrice,
      },
      summary: {
        itemCount: subBaskets.reduce((acc: number, sb: any) => acc + sb.items.reduce((sum: number, item: any) => sum + item.quantity, 0), 0),
      },
      isEmpty: subBaskets.length === 0 || subBaskets.every((sb: any) => sb.items.length === 0),
    };
  }

  static toView(domain: any): any {
    const subBaskets = domain.subBaskets.map((sb: any) => ({
      id: sb.id,
      shop: {
        title: sb.shop.title,
        logo: sb.shop.logo,
      },
      items: sb.items.map((item: any) => ({
        id: item.id,
        shopProductId: item.shopProductId,
        quantity: item.quantity,
        warranty: item.warranty,
        maxQuantity: item.maxQuantity,
        partNumber: item.partNumber || '',
        type: item.type === 'New' ? 'نو' : item.type === 'Stock' ? 'استوک' : 'زیرصفری',
        dayOfDelivery: item.dayOfDelivery || 1,
        isTipaxShipping: !!item.isTipaxShipping,
        isDirectShipping: !!item.isDirectShipping,
        canIncrease: item.quantity < item.maxQuantity,
        canDecrease: item.quantity > 1,
        product: {
          code: item.product.code,
          title: item.product.title,
          image: item.product.image,
        },
        price: {
          unitPrice: this.formatPrice(item.originalPrice),
          discountPrice: item.discountAmount > 0 ? this.formatPrice(item.finalUnitPrice) : null,
          hasDiscount: item.discountAmount > 0,
          totalPrice: this.formatPrice(item.originalPrice * item.quantity),
          finalTotalPrice: this.formatPrice(item.finalTotalPrice),
          originalPriceRaw: item.originalPrice,
          finalTotalPriceRaw: item.finalTotalPrice,
        }
      }))
    }));

    return {
      id: domain.id,
      userLocationId: domain.userLocationId,
      subBaskets,
      total: {
        totalPrice: this.formatPrice(domain.total.totalPrice),
        totalDiscount: this.formatPrice(domain.total.totalDiscount),
        finalPrice: this.formatPrice(domain.total.finalPrice),
        totalPriceRaw: domain.total.totalPrice,
        totalDiscountRaw: domain.total.totalDiscount,
        finalPriceRaw: domain.total.finalPrice,
      },
      summary: domain.summary,
      isEmpty: domain.isEmpty,
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

  private static formatPrice(price: number): string {
    const toman = price / 10;
    return new Intl.NumberFormat('fa-IR').format(toman) + ' تومان';
  }
}