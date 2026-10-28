'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Plus,
  ChevronLeft,
  AlertCircle,
  Clock,
  Hash,
  ShoppingBag,
} from 'lucide-react';
import { useGetTicketsList } from '@/domains/ticket/hooks/ticket.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { LottiePlayer } from '@/components/shared/Lottie/LottiePlayer';
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

interface TicketsListProps {
  initialStatus: string;
  initialPage: number;
}

export function TicketsList({ initialStatus, initialPage }: TicketsListProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState(initialStatus);
  const [page, setPage] = React.useState(initialPage);

  const { data: ticketsResponse, isLoading } = useGetTicketsList({
    status,
    pageNumber: page,
    pageSize: 10,
  });

  const { data: allTicketsResponse } = useGetTicketsList({
    status: '',
    pageNumber: 1,
    pageSize: 100,
  });

  const tickets = ticketsResponse?.items || [];
  const totalPages = ticketsResponse?.totalPages || 1;

  const allTickets = allTicketsResponse?.items || [];
  const totalCount = allTickets.length;
  const waitingCount = allTickets.filter((t) => t.status === 'WaitingForAnswer').length;
  const answeredCount = allTickets.filter((t) => t.status === 'Answered').length;
  const closedCount = allTickets.filter((t) => t.status === 'Closed').length;

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

  const getTicketStatusBadge = (ticketStatus: string, label: string) => {
    switch (ticketStatus) {
      case 'WaitingForAnswer':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Answered':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Closed':
        return 'text-muted-foreground bg-muted border-border';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5" dir="rtl">
      
      {/* هدر بخش پشتیبانی */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-base font-black text-foreground sm:text-lg">پشتیبانی و تیکت‌ها</h1>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            ارتباط مستقیم با کارشناسان فنی و پشتیبانی یدکچی، پیگیری درخواست‌ها و مرجوعی‌ها
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push('/profile/support/new')}
          className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>ثبت تیکت جدید</span>
        </Button>
      </div>

      {/* تب‌های کپسولی به سبک اپلیکیشن‌های بومی (بسیار سبک و فشرده) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {statusTabs.map((tab) => {
          const isActive = status === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-fast',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.2 text-3xs  font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {toPersianDigits(tab.count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* لیست تیکت‌ها */}
      {isLoading ? (
        <PageLoading label="در حال دریافت لیست تیکت‌های پشتیبانی..." />
      ) : tickets.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tickets.map((ticket) => {
              const statusClass = getTicketStatusBadge(ticket.status, ticket.statusLabel);

              return (
                <Card
                  key={ticket.id}
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs transition-colors hover:border-primary/30"
                >
                  <div>
                    {/* ردیف بالا: شناسه تیکت و وضعیت */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground " dir="ltr">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold text-foreground">
                          {toPersianDigits(ticket.ticketNumberFormatted)}
                        </span>
                      </div>

                      <span className={cn('rounded-lg border px-2.5 py-0.5 text-3xs font-bold', statusClass)}>
                        {ticket.statusLabel}
                      </span>
                    </div>

                    {/* موضوع و خلاصه تیکت */}
                    <div className="mt-3 flex flex-col gap-1.5 text-right">
                      <h2 className="text-xs sm:text-sm font-black text-foreground line-clamp-1 leading-snug">
                        {ticket.title}
                      </h2>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground/80" />
                          ثبت: {ticket.createDateFormatted}
                        </span>

                        {ticket.orderNumber && (
                          <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-3xs font-bold text-foreground">
                            <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                            سفارش: {toPersianDigits(ticket.orderNumber)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* نوار پایین کارت: هشدار پیام جدید و دکمه ورود به چت */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                    <div>
                      {ticket.hasUnread ? (
                        <div className="flex items-center gap-1.5 text-primary text-3xs font-bold animate-pulse">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>پاسخ جدید دریافت شد</span>
                        </div>
                      ) : (
                        <span className="text-3xs text-muted-foreground">پیام ناخوانده‌ای ندارید</span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/profile/support/${ticket.id}`)}
                      className="h-8 gap-1 rounded-xl text-3xs font-bold hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      <span>مشاهده گفتگو</span>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
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
        /* استیت خالی بدون تیکت */
        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center shadow-xs">
          <LottiePlayer path="/animations/ticket.json" className="mx-auto h-40 w-40" />
          <p className="text-xs font-bold text-muted-foreground">هیچ تیکت پشتیبانی یافت نشد.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/profile/support/new')}
            className="mt-2 h-9 gap-1.5 rounded-xl px-5 text-xs font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت اولین تیکت پشتیبانی</span>
          </Button>
        </div>
      )}
    </div>
  );
}