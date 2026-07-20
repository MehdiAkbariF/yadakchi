import { getTicketService } from '@/domains/ticket/services/ticket.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { CreateTicket } from '@/components/features/Profile/CreateTicket';

export default async function NewTicketPage() {
  const queryClient = new QueryClient();
  const ticketService = getTicketService();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'tickets', 'categories', 'User'],
      queryFn: () => ticketService.getTicketCategories('User'),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreateTicket />
    </HydrationBoundary>
  );
}