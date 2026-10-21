'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  CreditCard,
  ArrowRight,
  ArrowRightLeft,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
} from 'lucide-react';
import {
  useGetWalletBalances,
  useGetTransactions,
  useGetWithdrawRequests,
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { WithdrawModal } from './components/WithdrawModal';
import { cn } from '@/design-system/utils/cn';

const STATUS_OPTIONS = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'Pending', label: 'در انتظار' },
  { value: 'Paid', label: 'پرداخت شده' },
  { value: 'Cancelled', label: 'لغو شده' },
] as const;

export function WalletDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<'withdraws' | 'transactions'>('withdraws');
  const [withdrawStatus, setWithdrawStatus] = React.useState('');
  const [withdrawPage, setWithdrawPage] = React.useState(1);
  const [transactionPage, setTransactionPage] = React.useState(1);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false);

  const { data: wallet, isLoading: isWalletLoading } = useGetWalletBalances();
  const { data: transactionsResponse, isLoading: isTransactionsLoading } = useGetTransactions(transactionPage);
  const { data: withdrawsResponse, isLoading: isWithdrawsLoading } = useGetWithdrawRequests(withdrawPage, withdrawStatus);

  const transactions = transactionsResponse?.items || [];
  const transactionsTotalPages = transactionsResponse?.totalPages || 1;
  const withdraws = withdrawsResponse?.items || [];
  const withdrawsTotalPages = withdrawsResponse?.totalPages || 1;

  if (isWalletLoading) {
    return <PageLoading label="در حال لود کیف پول شما..." />;
  }

  return (
    <div className="flex w-full flex-col gap-6 select-none">
      <div className="mb-1 flex items-center gap-3 border-b border-border pb-3 lg:hidden">
        <button
          type="button"
          onClick={() => router.push('/profile')}
          aria-label="بازگشت"
          className="-me-1 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted"
        >
          <ArrowRight aria-hidden="true" className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground">کیف پول من</span>
      </div>

      <div className="flex w-full flex-col justify-between gap-5 border-b border-border pb-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Wallet aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-xl font-bold text-foreground">کیف پول</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>موجودی کل:</span>
            <span className="me-1 text-sm font-bold text-foreground">{wallet?.totalBalance}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/terms?section=wallet')}
            className="flex h-10 items-center justify-center gap-1.5 px-5 text-xs font-bold shadow-xs"
          >
            <Scale aria-hidden="true" className="h-4 w-4" />
            <span>قوانین</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex h-10 items-center justify-center gap-1.5 px-5 text-xs font-bold shadow-xs"
          >
            <CreditCard aria-hidden="true" className="h-4 w-4" />
            <span>درخواست برداشت</span>
          </Button>
        </div>
      </div>

      <div className="mt-2 flex w-full items-center gap-5 border-b border-border pb-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('withdraws')}
          className={cn(
            'border-b-2 pb-2 text-sm font-bold outline-none transition-colors',
            activeTab === 'withdraws' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          )}
        >
          درخواست‌های برداشت
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={cn(
            'border-b-2 pb-2 text-sm font-bold outline-none transition-colors',
            activeTab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          )}
        >
          تراکنش‌های مالی
        </button>
      </div>

      {activeTab === 'withdraws' ? (
        <div className="flex w-full flex-col gap-5">
          <div className="w-full max-w-xs self-start">
            <Select
              placeholder="فیلتر وضعیت درخواست"
              value={withdrawStatus}
              onChange={(e) => {
                setWithdrawStatus(e.target.value);
                setWithdrawPage(1);
              }}
              options={[...STATUS_OPTIONS]}
            />
          </div>

          {isWithdrawsLoading ? (
            <PageLoading label="در حال بارگذاری درخواست‌ها..." />
          ) : withdraws.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {withdraws.map((w: any) => (
                  <Card key={w.id} className="flex w-full flex-col justify-between gap-4 p-5">
                    <div className="flex w-full items-center justify-between border-b border-dashed border-border pb-3">
                      <span className="text-sm font-bold text-foreground">مبلغ درخواست: {w.amount}</span>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-bold',
                          w.statusColor === 'warning' && 'bg-warning/10 text-warning',
                          w.statusColor === 'success' && 'bg-success/10 text-success',
                          w.statusColor === 'destructive' && 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {w.statusLabel}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                      {w.cardNumber ? (
                        <div className="flex items-center gap-2">
                          <CreditCard aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                          <span>شماره کارت:</span>
                          <span className="font-bold text-foreground" dir="ltr">
                            {w.cardNumber}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <Clock aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                        <span>تاریخ درخواست:</span>
                        <span className="font-bold text-foreground">{w.createDateFormatted}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={withdrawPage}
                totalPages={withdrawsTotalPages}
                onPageChange={(p) => setWithdrawPage(p)}
              />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card py-16 text-center">
              <ArrowRightLeft aria-hidden="true" className="h-10 w-10 text-muted-foreground/60" />
              <span className="text-xs font-bold text-muted-foreground">
                هیچ درخواست برداشتی در این دسته یافت نشد.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-5">
          {isTransactionsLoading ? (
            <PageLoading label="در حال بارگذاری تراکنش‌ها..." />
          ) : transactions.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {transactions.map((t: any, idx: number) => (
                  <Card key={idx} className="flex w-full flex-col justify-between gap-4 p-5">
                    <div className="flex w-full items-center justify-between border-b border-dashed border-border pb-3">
                      <div className="flex items-center gap-2">
                        {t.isSuccess ? (
                          <ArrowDownLeft
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 rounded-full bg-success/10 p-1 text-success"
                          />
                        ) : (
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 rounded-full bg-destructive/10 p-1 text-destructive"
                          />
                        )}
                        <span className="text-sm font-bold text-foreground">{t.typeLabel}</span>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-bold',
                          t.isSuccess ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {t.isSuccess ? 'موفق' : 'ناموفق'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                      <div className="flex w-full items-center justify-between">
                        <span>مبلغ تراکنش:</span>
                        <span className="font-bold text-foreground">{t.amount}</span>
                      </div>
                      {t.traceNo ? (
                        <div className="flex w-full items-center justify-between">
                          <span>شماره پیگیری:</span>
                          <span className="font-bold text-foreground">{t.traceNo}</span>
                        </div>
                      ) : null}
                      <div className="flex w-full items-center justify-between">
                        <span>تاریخ تراکنش:</span>
                        <span className="font-bold text-foreground">{t.createDateFormatted}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Pagination
                currentPage={transactionPage}
                totalPages={transactionsTotalPages}
                onPageChange={(p) => setTransactionPage(p)}
              />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card py-16 text-center">
              <ArrowRightLeft aria-hidden="true" className="h-10 w-10 text-muted-foreground/60" />
              <span className="text-xs font-bold text-muted-foreground">
                هیچ تراکنشی در این دسته یافت نشد.
              </span>
            </div>
          )}
        </div>
      )}

      <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} wallet={wallet} />
    </div>
  );
}