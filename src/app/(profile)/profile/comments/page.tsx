import { getServerCurrentUser } from '@/domains/auth/server.auth';
import { getCommentService } from '@/domains/front/comment/services/comment.service';
import { getInquiryService } from '@/domains/front/inquiry/services/inquiry.service';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { CommentsDashboard } from '@/components/features/Profile/CommentsDashboard';

export default async function CommentsPage() {
  const queryClient = new QueryClient();
  const user = await getServerCurrentUser();
  const commentService = getCommentService();
  const inquiryService = getInquiryService();

  if (user) {
    queryClient.setQueryData(['auth', 'user'], user);
  }

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['user', 'comments', 'pending', 1, 10],
        queryFn: () => commentService.getPendingComments(1, 10),
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'comments', 'user', 1, 10],
        queryFn: () => commentService.getUserComments(1, 10),
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'inquiries', 'user', 1, 10],
        queryFn: () => inquiryService.getUserInquiries(1, 10),
      }),
    ]);
  } catch (error) {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommentsDashboard />
    </HydrationBoundary>
  );
}