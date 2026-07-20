import { 
  TicketCategoryDto, 
  TicketMessageDto, 
  TicketDetailsDto, 
  TicketListItemDto 
} from '../types/dto.types';
import { 
  TicketCategory, 
  TicketMessage, 
  TicketDetails, 
  TicketListItem 
} from '../types/domain.types';
import { 
  TicketCategoryViewModel, 
  TicketMessageViewModel, 
  TicketDetailsViewModel, 
  TicketListItemViewModel 
} from '../types/view.types';
import { TICKET_CONSTANTS } from '../constants/ticket.constants';

export class TicketMapper {
  static toDomainCategory(dto: TicketCategoryDto): TicketCategory {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      type: dto.type,
    };
  }

  static toViewCategory(domain: TicketCategory): TicketCategoryViewModel {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      type: domain.type,
    };
  }

  static toDomainMessage(dto: TicketMessageDto): TicketMessage {
    return {
      id: dto.id,
      text: dto.text,
      ticketId: dto.ticketId,
      senderId: dto.senderId,
      createDate: dto.createDate,
      wasHelpful: dto.wasHelpful,
      type: dto.type,
      isRead: dto.isRead,
      sender: {
        id: dto.sender?.id || dto.senderId,
        fullName: dto.sender?.fullName || dto.sender?.userName || '',
        phoneNumber: dto.sender?.phoneNumber || '',
      },
      attachments: dto.attachments || [],
    };
  }

  static toViewMessage(domain: TicketMessage, currentUserId?: string): TicketMessageViewModel {
    return {
      id: domain.id,
      text: domain.text,
      ticketId: domain.ticketId,
      senderId: domain.senderId,
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
      wasHelpful: domain.wasHelpful,
      isMyMessage: currentUserId ? domain.senderId === currentUserId : domain.type === 'User' || domain.type === 'Seller',
      senderName: domain.sender.fullName || 'کاربر سیستم',
      attachments: domain.attachments,
    };
  }

  static toDomainDetails(dto: TicketDetailsDto): TicketDetails {
    return {
      id: dto.id,
      ticketNumber: dto.ticketNumber,
      title: dto.title,
      status: dto.status,
      orderNumber: dto.orderNumber,
      categoryId: dto.categoryId,
      resolvedAt: dto.resolvedAt,
      hasAdminUnread: dto.hasAdminUnread,
      hasUserUnread: dto.hasUserUnread,
      createDate: dto.createDate,
      updateDate: dto.updateDate,
      category: this.toDomainCategory(dto.category),
      messages: (dto.messages || []).map(m => this.toDomainMessage(m)),
    };
  }

  static toViewDetails(domain: TicketDetails, currentUserId?: string): TicketDetailsViewModel {
    return {
      id: domain.id,
      ticketNumber: domain.ticketNumber,
      ticketNumberFormatted: this.formatNumber(domain.ticketNumber),
      title: domain.title,
      status: domain.status,
      statusLabel: TICKET_CONSTANTS.STATUS[domain.status] || domain.status,
      statusBadgeColor: TICKET_CONSTANTS.STATUS_COLORS[domain.status] || 'secondary',
      orderNumber: domain.orderNumber,
      categoryId: domain.categoryId,
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
      categoryName: domain.category.name,
      messages: domain.messages.map(m => this.toViewMessage(m, currentUserId)),
    };
  }

  static toDomainListItem(dto: TicketListItemDto): TicketListItem {
    return {
      id: dto.id,
      ticketNumber: dto.ticketNumber,
      title: dto.title,
      type: dto.type,
      status: dto.status,
      orderNumber: dto.orderNumber,
      hasAdminUnread: dto.hasAdminUnread,
      hasUserUnread: dto.hasUserUnread,
      createDate: dto.createDate,
      updateDate: dto.updateDate,
    };
  }

  static toViewListItem(domain: TicketListItem): TicketListItemViewModel {
    return {
      id: domain.id,
      ticketNumber: domain.ticketNumber,
      ticketNumberFormatted: this.formatNumber(domain.ticketNumber),
      title: domain.title,
      type: domain.type,
      status: domain.status,
      statusLabel: TICKET_CONSTANTS.STATUS[domain.status] || domain.status,
      statusBadgeColor: TICKET_CONSTANTS.STATUS_COLORS[domain.status] || 'secondary',
      orderNumber: domain.orderNumber,
      hasUnread: domain.hasUserUnread,
      createDateFormatted: new Date(domain.createDate).toLocaleDateString('fa-IR'),
    };
  }

  private static formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value);
  }
}