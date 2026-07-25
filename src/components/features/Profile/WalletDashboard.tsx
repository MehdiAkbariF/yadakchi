'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useGetWalletBalances, 
  useGetTransactions, 
  useGetWithdrawRequests 
} from '@/domains/userpanel/hooks/userpanel.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { Button } from '@/components/primitives/Button/Button';
import { Select } from '@/components/primitives/Select/Select';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Pagination } from '@/components/composites/Pagination/Pagination';
import { WithdrawModal } from './components/WithdrawModal';
import { 
  Wallet, 
  CreditCard, 
  ArrowRight, 
  ArrowRightLeft, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Scale 
} from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export function WalletDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'withdraws' | 'transactions'>('withdraws');
  const [withdrawStatus, setWithdrawStatus] = useState('');
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { data: wallet, isLoading: isWalletLoading } = useGetWalletBalances();
  const { data: transactionsResponse, isLoading: isTransactionsLoading } = useGetTransactions(transactionPage);
  const { data: withdrawsResponse, isLoading: isWithdrawsLoading } = useGetWithdrawRequests(withdrawPage, withdrawStatus);

  const transactions = transactionsResponse?.items || [];
  const transactionsTotalPages = transactionsResponse?.totalPages || 1;

  const withdraws = withdrawsResponse?.items || [];
  const withdrawsTotalPages = withdrawsResponse?.totalPages || 1;

  const statusOptions = [
    { value: '', label: 'همه درخواست‌ها' },
    { value: 'Pending', label: 'در انتظار' },
    { value: 'Paid', label: 'پرداخت شده' },
    { value: 'Cancelled', label: 'لغو شده' }
  ];

  if (isWalletLoading) {
    return <PageLoading message="در حال لود اطلاعات کیف پول..." />;
  }

  return (
    <div className="w-full flex flex-col gap-6 select-none text-right" dir="rtl">
      
      <div className="lg:hidden flex items-center gap-3 border-b pb-3 mb-1 shrink-0">
        <button 
          onClick={() => router.push('/profile')}
          className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
          aria-label="Back"
        >
          <ArrowRight className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-bold font-iran-yekan text-foreground">کیف پول من</span>
      </div>

      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-5 border-b pb-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary shrink-0" />
            <span className="text-lg md:text-xl font-black text-foreground font-iran-yekan">کیف پول</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-iran-sans">
            <span>موجودی کیف پول:</span>
            <span className="font-bold text-foreground text-sm mr-1">{wallet?.totalBalance}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/terms?section=wallet')}
            className="rounded-xl font-iran-sans font-bold text-xs h-10 px-5 border-zinc-200 hover:bg-muted text-foreground flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Scale className="h-4 w-4" />
            <span>قوانین</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="rounded-xl font-iran-sans font-bold text-xs h-10 px-5 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CreditCard className="h-4 w-4" />
            <span>برداشت موجودی</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-5 border-b pb-2.5 w-full mt-2">
        <button
          onClick={() => setActiveTab('withdraws')}
          className={cn(
            "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none",
            activeTab === 'withdraws' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
          )}
        >
          درخواست‌های برداشت
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            "text-xs md:text-sm font-bold font-iran-yekan pb-2 border-b-2 transition-all outline-none",
            activeTab === 'transactions' ? "text-primary border-primary" : "text-muted-foreground border-transparent"
          )}
        >
          تراکنش‌های اخیر
        </button>
      </div>

      {activeTab === 'withdraws' ? (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          <div className="w-full max-w-xs self-start">
            <Select
              placeholder="فیلتر وضعیت درخواست"
              value={withdrawStatus}
              onChange={(e) => {
                setWithdrawStatus(e.target.value);
                setWithdrawPage(1);
              }}
              options={statusOptions}
            />
          </div>

          {isWithdrawsLoading ? (
            <PageLoading message="در حال دریافت درخواست‌های برداشت..." />
          ) : withdraws.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {withdraws.map((w: any) => (
                  <Card key={w.id} className="w-full border rounded-xl p-5 bg-background shadow-sm hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between border-b border-dashed pb-3 w-full">
                      <span className="text-xs md:text-sm font-black text-foreground font-iran-sans">مبلغ برداشت: {w.amount}</span>
                      <span className={cn(
                        "font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full",
                        w.statusColor === 'warning' && "bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400",
                        w.statusColor === 'success' && "bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400",
                        w.statusColor === 'destructive' && "bg-destructive/10 text-destructive"
                      )}>
                        {w.statusLabel}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-muted-foreground font-iran-sans text-right">
                      {w.cardNumber && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-zinc-400" />
                          <span>واریز به کارت:</span>
                          <span className="font-bold text-foreground ltr:inline-block" dir="ltr">{w.cardNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
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
            <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
              <ArrowRightLeft className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
              <span className="text-xs font-bold font-iran-sans text-muted-foreground">هیچ درخواست برداشتی در این بخش یافت نشد.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          {isTransactionsLoading ? (
            <PageLoading message="در حال دریافت تراکنش‌ها..." />
          ) : transactions.length > 0 ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {transactions.map((t: any, idx: number) => (
                  <Card key={idx} className="w-full border rounded-xl p-5 bg-background shadow-sm hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between border-b border-dashed pb-3 w-full">
                      <div className="flex items-center gap-2">
                        {t.isSuccess ? (
                          <ArrowDownLeft className="h-5 w-5 text-success-500 bg-success-50 dark:bg-success-950/20 p-1 rounded-full shrink-0" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-destructive bg-destructive/10 p-1 rounded-full shrink-0" />
                        )}
                        <span className="text-xs md:text-sm font-black text-foreground font-iran-sans">{t.typeLabel}</span>
                      </div>
                      <span className={cn(
                        "font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full",
                        t.isSuccess ? "bg-success-50 text-success-600 dark:bg-success-950/20" : "bg-destructive/10 text-destructive"
                      )}>
                        {t.isSuccess ? "موفق" : "ناموفق"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs text-muted-foreground font-iran-sans text-right">
                      <div className="flex items-center justify-between w-full">
                        <span>مبلغ تراکنش:</span>
                        <span className="font-bold text-foreground">{t.amount}</span>
                      </div>
                      {t.traceNo && (
                        <div className="flex items-center justify-between w-full">
                          <span>کد رهگیری:</span>
                          <span className="font-bold text-foreground">{t.traceNo}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full">
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
            <div className="w-full py-16 text-center border border-dashed rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
              <ArrowRightLeft className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
              <span className="text-xs font-bold font-iran-sans text-muted-foreground">هیچ تراکنشی در حساب شما ثبت نشده است.</span>
            </div>
          )}
        </div>
      )}

      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
        wallet={wallet}
      />

    </div>
  );
}