'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetTicketsList } from '@/domains/ticket/hooks/ticket.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { cn } from '@/design-system/utils/cn';
import { MessageSquare, Plus, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react';

interface TicketsListProps {
  initialStatus: string;
  initialPage: number;
}

export function TicketsList({ initialStatus, initialPage }: TicketsListProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);

  const { data: ticketsResponse, isLoading } = useGetTicketsList({
    status,
    pageNumber: page,
    pageSize: 10
  });

  const { data: allTicketsResponse } = useGetTicketsList({
    status: '',
    pageNumber: 1,
    pageSize: 100
  });

  const tickets = ticketsResponse?.items || [];
  const totalPages = ticketsResponse?.totalPages || 1;

  const allTickets = allTicketsResponse?.items || [];
  const totalCount = allTickets.length;
  const waitingCount = allTickets.filter(t => t.status === 'WaitingForAnswer').length;
  const answeredCount = allTickets.filter(t => t.status === 'Answered').length;
  const closedCount = allTickets.filter(t => t.status === 'Closed').length;

  const handleTabChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    router.push(`/profile/support?status=${newStatus}`);
  };

  const statusTabs = [
    { id: '', label: 'همه تیکت‌ها', count: totalCount },
    { id: 'WaitingForAnswer', label: 'در انتظار پاسخ', count: waitingCount },
    { id: 'Answered', label: 'پاسخ داده شده', count: answeredCount },
    { id: 'Closed', label: 'بسته شده', count: closedCount },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center justify-between border-b pb-3 mb-1 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/profile')}
            className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold font-iran-yekan text-foreground">پشتیبانی و تیکت‌ها</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/profile/support/new')}
          className="rounded-xl text-[10px] h-9 px-4 py-1.5 border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-center gap-1 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>ثبت تیکت</span>
        </Button>
      </div>

      <div className="hidden lg:flex items-center justify-between w-full border-b pb-3">
        <span className="text-sm font-black text-foreground font-iran-yekan">پشتیبانی و تیکت‌ها</span>
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push('/profile/support/new')}
          className="rounded-xl text-xs h-10 px-5 py-2 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>ثبت تیکت پشتیبانی جدید</span>
        </Button>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 w-full shrink-0 select-none px-1">
        {statusTabs.map((tab) => {
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "w-32 h-24 md:w-40 md:h-26 shrink-0 flex flex-col items-center justify-center gap-2 border rounded-2xl bg-background transition-all outline-none shadow-sm px-4",
                isActive 
                  ? "border-primary bg-primary/5 text-primary scale-105 font-bold" 
                  : "border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:border-zinc-300 hover:text-foreground"
              )}
            >
              <MessageSquare className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="text-[10px] md:text-xs font-bold font-iran-sans leading-none truncate w-full">{tab.label}</span>
              <span className={cn(
                "text-[9px] md:text-[10px] font-bold font-iran-sans px-2 py-0.5 rounded-full shrink-0 mt-0.5",
                isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {tab.count} مورد
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <PageLoading message="در حال دریافت لیست تیکت‌های شما..." />
      ) : tickets.length > 0 ? (
        <div className="flex flex-col gap-6 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="w-full border rounded-xl p-5 md:p-6 bg-background shadow-sm hover:border-primary/25 transition-all flex flex-col justify-between gap-4">
                
                <div className="flex items-center justify-between border-b border-dashed pb-3 w-full">
                  <span className="text-xs md:text-sm font-black text-foreground font-iran-sans">شماره تیکت: {ticket.ticketNumberFormatted}</span>
                  <span className={cn(
                    "font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full",
                    ticket.status === 'WaitingForAnswer' && "bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400",
                    ticket.status === 'Answered' && "bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400",
                    ticket.status === 'Closed' && "bg-muted text-muted-foreground"
                  )}>
                    {ticket.statusLabel}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 w-full text-right font-iran-sans text-xs text-muted-foreground">
                  <h4 className="text-xs md:text-sm font-bold text-foreground line-clamp-1">{ticket.title}</h4>
                  <div className="flex items-center justify-between mt-2.5 w-full text-[10px] md:text-xs">
                    <span>ثبت: {ticket.createDateFormatted}</span>
                    {ticket.orderNumber && (
                      <span className="font-bold text-foreground">کد سفارش: {ticket.orderNumber}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full pt-3.5 mt-1 border-t border-dashed">
                  <div className="flex items-center gap-1.5 text-primary text-[10px] md:text-xs font-bold">
                    {ticket.hasUnread && (
                      <>
                        <AlertCircle className="h-4 w-4 text-primary shrink-0 animate-pulse" />
                        <span>پاسخ جدید خوانده نشده</span>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/profile/support/${ticket.id}`)}
                    className="rounded-xl text-[10px] md:text-xs h-9.5 px-5 py-1.5 border-zinc-200 hover:bg-muted text-foreground flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>مشاهده گفتگو</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

              </Card>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              router.push(`/profile/support?status=${status}&page=${p}`);
            }}
          />

        </div>
      ) : (
        <div className="w-full py-16 text-center border border-dashed rounded-xl bg-background flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground font-iran-sans">هیچ تیکت پشتیبانی یافت نشد.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/profile/support/new')}
            className="rounded-xl mt-4 text-xs font-bold font-iran-sans h-10 px-6 py-2 flex items-center justify-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت اولین تیکت پشتیبانی</span>
          </Button>
        </div>
      )}

    </div>
  );
}