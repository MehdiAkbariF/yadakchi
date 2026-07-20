export interface TicketCategoryViewModel {
  id: string;
  name: string;
  description: string;
  type: 'User' | 'Seller' | 'ReturnRequest' | 'DamageReport';
}

export interface TicketMessageViewModel {
  id: string;
  text: string;
  ticketId: string;
  senderId: string;
  createDateFormatted: string;
  wasHelpful: boolean | null;
  isMyMessage: boolean;
  senderName: string;
  attachments: string[];
}

export interface TicketDetailsViewModel {
  id: string;
  ticketNumber: number;
  ticketNumberFormatted: string;
  title: string;
  status: 'WaitingForAnswer' | 'Answered' | 'Closed';
  statusLabel: string;
  statusBadgeColor: 'warning' | 'success' | 'secondary';
  orderNumber: number | null;
  categoryId: string;
  createDateFormatted: string;
  categoryName: string;
  messages: TicketMessageViewModel[];
}

export interface TicketListItemViewModel {
  id: string;
  ticketNumber: number;
  ticketNumberFormatted: string;
  title: string;
  type: string;
  status: 'WaitingForAnswer' | 'Answered' | 'Closed';
  statusLabel: string;
  statusBadgeColor: 'warning' | 'success' | 'secondary';
  orderNumber: number | null;
  hasUnread: boolean;
  createDateFormatted: string;
}

export interface CreateTicketRequest {
  categoryId: string;
  title: string;
  text: string;
  orderNumber?: number;
  attachments?: File[];
}

export interface CreateMessageRequest {
  text: string;
  ticketId: string;
  wasHelpful?: boolean;
  attachments?: File[];
}

export interface TicketFilters {
  status?: string;
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
}