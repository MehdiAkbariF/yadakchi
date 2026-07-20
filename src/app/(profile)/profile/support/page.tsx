import { getTicketService } from '@/domains/ticket/services/ticket.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { TicketsList } from '@/components/features/Profile/TicketsList';

interface SupportPageProps {
  searchParams: { status?: string; page?: string };
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const status = searchParams.status || '';
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const queryClient = new QueryClient();
  const ticketService = getTicketService();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['user', 'tickets', 'list', { status, orderBy: '', pageNumber: page, pageSize: 10 }],
      queryFn: () => ticketService.getTicketsList({ status, pageNumber: page, pageSize: 10 }),
    });
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TicketsList initialStatus={status} initialPage={page} />
    </HydrationBoundary>
  );
}