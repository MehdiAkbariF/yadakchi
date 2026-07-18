export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  type: 'User' | 'Seller' | 'ReturnRequest' | 'DamageReport';
}

export interface TicketSender {
  id: string;
  fullName: string;
  phoneNumber: string;
}

export interface TicketMessage {
  id: string;
  text: string;
  ticketId: string;
  senderId: string;
  createDate: string;
  wasHelpful: boolean | null;
  type: 'User' | 'Seller' | 'Support' | 'Admin';
  isRead: boolean;
  sender: TicketSender;
  attachments: string[];
}

export interface TicketDetails {
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
  category: TicketCategory;
  messages: TicketMessage[];
}

export interface TicketListItem {
  id: string;
  ticketNumber: number;
  title: string;
  type: string;
  status: 'WaitingForAnswer' | 'Answered' | 'Closed';
  orderNumber: number | null;
  hasAdminUnread: boolean;
  hasUserUnread: boolean;
  createDate: string;
  updateDate: string | null;
}