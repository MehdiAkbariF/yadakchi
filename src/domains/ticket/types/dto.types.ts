export interface TicketCategoryDto {
  id: string;
  name: string;
  description: string;
  type: 'User' | 'Seller' | 'ReturnRequest' | 'DamageReport';
}

export interface TicketSenderDto {
  id: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  restrictionStatus: string;
  email: string | null;
  createDate: string;
}

export interface TicketMessageDto {
  id: string;
  text: string;
  ticketId: string;
  senderId: string;
  createDate: string;
  wasHelpful: boolean | null;
  type: 'User' | 'Seller' | 'Support' | 'Admin';
  isRead: boolean;
  sender: TicketSenderDto;
  attachments: string[];
}

export interface TicketDetailsDto {
  id: string;
  ticketNumber: number;
  title: string;
  status: 'WaitingForAnswer' | 'Answered' | 'Closed';
  orderNumber: number | null;
  categoryId: string;
  resolvedAt: string | null;
  hasAdminUnread: boolean;
  hasUserUnread: boolean;
  createDate: string;
  updateDate: string | null;
  category: TicketCategoryDto;
  messages: TicketMessageDto[];
}

export interface TicketListItemDto {
  id: string;
  ticketNumber: number;
  title: string;
  type: string;
  status: 'WaitingForAnswer' | 'Answered' | 'Closed';
  orderNumber: number | null;
  resolvedAt: string | null;
  hasAdminUnread: boolean;
  hasUserUnread: boolean;
  createDate: string;
  updateDate: string | null;
}

export interface TicketsListResponseDto {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: TicketListItemDto[];
}

export interface CreateTicketRequestDto {
  CategoryId: string;
  Title: string;
  Text: string;
  OrderNumber?: number;
  Attachments?: File[];
}

export interface CreateMessageRequestDto {
  Text: string;
  TicketId: string;
  WasHelpful?: boolean;
  Attachments?: File[];
}