'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  Plus,
  Wifi,
  Sparkles,
  ChevronLeft,
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
import { toPersianDigits } from '@/core/utils/formatters';
import { cn } from '@/design-system/utils/cn';

const STATUS_OPTIONS = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'Pending', label: 'در انتظار پرداخت' },
  { value: 'Paid', label: 'تسویه شده' },
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
    return <PageLoading label="در حال دریافت اطلاعات کیف پول..." />;
  }

  const getWithdrawStatusMeta = (status: string, statusLabel: string) => {
    switch (status) {
      case 'Paid':
        return { label: statusLabel || 'تسویه شده', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'Pending':
        return { label: statusLabel || 'در حال بررسی', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'Cancelled':
        return { label: statusLabel || 'لغو شده', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: statusLabel || status, color: 'text-muted-foreground bg-muted border-border' };
    }
  };

  return (
    <div className="flex w-full flex-col gap-5" dir="rtl">
      
      {/* ================= 1. کارت VIP متالیک با انیمیشن شاینینگ (Titanium & Copper Smart Card) ================= */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-[#18191D] to-zinc-900 p-6 sm:p-7 text-white shadow-2xl shadow-black/40">
        
        {/* هاله نور مس متالیک در گوشه کارت جهت حفظ تم برند */}
        <div className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -start-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* انیمیشن براق شاینینگ شبیه به بازتاب نور روی فلز کارت */}
        <motion.div
          initial={{ x: '-150%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
            repeatDelay: 2.5,
          }}
          className="pointer-events-none absolute inset-0 -skew-x-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        <div className="relative z-10 flex flex-col justify-between gap-6">
          {/* هدر کارت: چیپ هوشمند، لوگو و دکمه قوانین */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* شبیه‌ساز چیپ طلایی کارت اعتباری */}
              <div className="flex h-8 w-11 items-center justify-center rounded-lg border border-amber-400/30 bg-gradient-to-br from-amber-200/20 via-amber-400/30 to-amber-600/20 shadow-inner">
                <div className="h-4 w-7 rounded-xs border border-amber-300/40 opacity-75" />
              </div>

              <Wifi className="h-5 w-5 text-white/50 rotate-90" />
              <span className="text-xs font-black tracking-widest text-white/80"> کیف پول</span>
            </div>

            <button
              type="button"
              onClick={() => router.push('/terms?section=wallet')}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-3xs font-bold text-white/80 backdrop-blur-md hover:bg-white/15 transition-all"
            >
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>قوانین تسویه</span>
            </button>
          </div>

          {/* موجودی کل با تایپوگرافی شارپ پلاتینیومی */}
          <div className="flex flex-col gap-1.5">
            <span className="text-3xs font-bold tracking-wider text-white/60">موجودی کل حساب شما</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {wallet?.totalBalance || '۰ تومان'}
              </span>
            </div>
          </div>

          {/* نوار پایین کارت: موجودی قابل برداشت و دکمه تسویه */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex flex-col">
              <span className="text-3xs text-white/60">موجودی قابل برداشت:</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5">
                {wallet?.withdrawableBalance || '۰ تومان'}
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="h-10 gap-2 rounded-xl px-5 text-xs font-black shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>ثبت درخواست برداشت وجه</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ================= 2. تب‌های کپسولی سوئیچ بین برداشت‌ها و تراکنش‌ها ================= */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('withdraws')}
            className={cn(
              'rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'withdraws'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            درخواست‌های تسویه ({toPersianDigits(withdraws.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={cn(
              'rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'transactions'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            گردش و تراکنش‌های مالی
          </button>
        </div>

        {activeTab === 'withdraws' && (
          <div className="w-full sm:w-44">
            <Select
              placeholder="فیلتر وضعیت"
              value={withdrawStatus}
              onChange={(e) => {
                setWithdrawStatus(e.target.value);
                setWithdrawPage(1);
              }}
              options={[...STATUS_OPTIONS]}
            />
          </div>
        )}
      </div>

      {/* ================= 3. محتوای تب درخواست‌های برداشت ================= */}
      {activeTab === 'withdraws' ? (
        <div className="flex flex-col gap-4">
          {isWithdrawsLoading ? (
            <PageLoading label="در حال دریافت درخواست‌های برداشت..." />
          ) : withdraws.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {withdraws.map((w: any) => {
                const meta = getWithdrawStatusMeta(w.status, w.statusLabel);

                return (
                  <Card key={w.id} className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs">
                    <div>
                      <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <div className="flex flex-col">
                          <span className="text-3xs text-muted-foreground">مبلغ درخواستی تسویه:</span>
                          <span className="text-base font-black text-foreground mt-0.5">{w.amount}</span>
                        </div>
                        <span className={cn('rounded-lg border px-2.5 py-1 text-2xs font-bold', meta.color)}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
                        {w.cardNumber && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                              واریز به کارت:
                            </span>
                            <span className="font-bold text-foreground " dir="ltr">
                              {w.cardNumber}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            زمان ثبت:
                          </span>
                          <span className="font-bold text-foreground">{w.createDateFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center shadow-xs">
              <CreditCard className="h-10 w-10 text-muted-foreground/30 mb-1" />
              <span className="text-xs font-bold text-muted-foreground">
                هیچ درخواست برداشتی در این دسته یافت نشد.
              </span>
            </div>
          )}

          <Pagination
            currentPage={withdrawPage}
            totalPages={withdrawsTotalPages}
            onPageChange={(p) => setWithdrawPage(p)}
          />
        </div>
      ) : (
        /* ================= 4. محتوای تب تراکنش‌های مالی ================= */
        <div className="flex flex-col gap-4">
          {isTransactionsLoading ? (
            <PageLoading label="در حال دریافت گردش حساب..." />
          ) : transactions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {transactions.map((t: any, idx: number) => (
                <Card key={idx} className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4.5 sm:p-5 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          t.isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        )}>
                          {t.isSuccess ? <ArrowDownLeft className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-foreground">{t.typeLabel}</span>
                          <span className="text-3xs text-muted-foreground">{t.createDateFormatted}</span>
                        </div>
                      </div>

                      <span className={cn(
                        'rounded-lg px-2.5 py-1 text-2xs font-bold',
                        t.isSuccess ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'
                      )}>
                        {t.isSuccess ? 'موفق' : 'ناموفق'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>مبلغ تراکنش:</span>
                        <span className="font-black text-foreground text-sm">{t.amount}</span>
                      </div>
                      {t.traceNo && (
                        <div className="flex items-center justify-between text-muted-foreground border-t border-dashed border-border/50 pt-2">
                          <span>شماره پیگیری:</span>
                          <span className="font-bold text-foreground " dir="ltr">{t.traceNo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card py-16 text-center shadow-xs">
              <Wallet className="h-10 w-10 text-muted-foreground/30 mb-1" />
              <span className="text-xs font-bold text-muted-foreground">
                هیچ تراکنشی در حساب شما ثبت نشده است.
              </span>
            </div>
          )}

          <Pagination
            currentPage={transactionPage}
            totalPages={transactionsTotalPages}
            onPageChange={(p) => setTransactionPage(p)}
          />
        </div>
      )}

      {/* مودال درخواست برداشت وجه */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        wallet={wallet}
      />
    </div>
  );
}