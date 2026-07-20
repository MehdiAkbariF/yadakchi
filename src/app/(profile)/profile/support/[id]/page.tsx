import { getTicketService } from '@/domains/ticket/services/ticket.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { TicketDetails } from '@/components/features/Profile/TicketDetails';

interface TicketDetailsPageProps {
  params: { id: string };
}

export default async function TicketDetailsPage({ params }: TicketDetailsPageProps) {
  const queryClient = new QueryClient();
  const ticketService = getTicketService();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'tickets', 'details', params.id],
      queryFn: () => ticketService.getTicketDetails(params.id),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TicketDetails ticketId={params.id} />
    </HydrationBoundary>
  );
}