export const TICKET_ENDPOINTS = {
  POST_TICKET: '/api/Ticket/Ticket',
  GET_TICKET: '/api/Ticket/Ticket',
  POST_DAMAGE_REPORT: '/api/Ticket/DamageReport',
  GET_TICKETS: '/api/Ticket/Tickets',
  GET_DAMAGE_REPORTS: '/api/Ticket/DamageReports',
  GET_CATEGORIES: '/api/Ticket/TicketCategory',
  POST_MESSAGE: '/api/Ticket/TicketMessage',
  POST_READ_MESSAGES: '/api/Ticket/TicketMessagesRead',
  POST_HELPFUL: '/api/Ticket/TicketMessageWasHalpful',
} as const;