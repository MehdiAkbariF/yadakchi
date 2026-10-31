'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetTicketDetails,
  useSendTicketMessage,
  useMarkMessagesAsRead,
} from '@/domains/ticket/hooks/ticket.hooks';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Button } from '@/components/primitives/Button/Button';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { cn } from '@/design-system/utils/cn';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import {
  ArrowRight,
  Send,
  Paperclip,
  X,
  FileText,
  User,
  Headphones,
  CheckCheck,
  Download,
  AlertCircle,
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { getFullUrl, toPersianDigits } from '@/core/utils/formatters';

interface TicketDetailsProps {
  ticketId: string;
}

export function TicketDetails({ ticketId }: TicketDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: ticket, isLoading, isError } = useGetTicketDetails(ticketId, user?.id);
  const sendMessage = useSendTicketMessage();
  const readMessages = useMarkMessagesAsRead(ticketId);

  const [messageText, setMessageText] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // علامت‌گذاری پیام‌های ناخوانده پشتیبانی
  React.useEffect(() => {
    if (ticket?.messages) {
      const unreadIds = ticket.messages
        .filter((m) => !m.isMyMessage && !m.isRead)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        readMessages.mutate(unreadIds);
      }
    }
  }, [ticket]);

  // اسکرول خودکار به انتهای صفحه
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (isLoading) {
    return <PageLoading message="در حال بازگذاری مکالمات پشتیبانی..." />;
  }

  if (isError || !ticket) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 py-20 text-center" dir="rtl">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-bold text-foreground">تیکت مورد نظر یافت نشد</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/profile/support')}>
          بازگشت به پشتیبانی
        </Button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 5 - attachments.length;

      if (filesArray.length > remainingSlots) {
        showToast.error(`امکان افزودن بیش از ۵ فایل وجود ندارد`);
      }

      setAttachments((prev) => [...prev, ...filesArray].slice(0, 5));
    }
  };

  const handleRemoveFile = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (messageText.trim().length < 2) {
      showToast.error('متن پیام شما باید حداقل ۲ کاراکتر باشد');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        ticketId,
        text: messageText.trim(),
        attachments,
      });

      showToast.success('پیام شما با موفقیت ارسال شد');
      setMessageText('');
      setAttachments([]);
    } catch (error: any) {
      showToast.error(error?.userMessage || 'خطا در ارسال پیام');
    }
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'WaitingForAnswer':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      case 'Answered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
      case 'Closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div
      className="flex flex-1 flex-col h-[calc(100dvh-70px)] md:h-[calc(100vh-120px)] -mx-4 -my-4 md:-mx-6 md:-my-6 bg-card border-x-0 md:border md:border-border/80 md:rounded-2xl overflow-hidden shadow-xs select-none"
      dir="rtl"
    >
      {/* ================= هدر چت ================= */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/profile/support')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="بازگشت به لیست"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
              {ticket.title}
            </h1>
            <span className="text-2xs text-muted-foreground mt-0.5">
              شماره پیگیری: #{toPersianDigits(ticket.ticketNumberFormatted || ticket.ticketNumber)}
            </span>
          </div>
        </div>

        <span
          className={cn(
            'px-2.5 py-1 rounded-lg border text-2xs font-bold shrink-0',
            getStatusBadge()
          )}
        >
          {ticket.statusLabel}
        </span>
      </div>

      {/* ================= بدنه پیام‌ها ================= */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 no-scrollbar bg-dot-pattern">
        {ticket.messages && ticket.messages.length > 0 ? (
          ticket.messages.map((msg) => {
            const isMyMsg = msg.isMyMessage;

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2.5 w-full max-w-[88%] sm:max-w-[75%]',
                  isMyMsg ? 'self-start flex-row' : 'self-end flex-row-reverse'
                )}
              >
                {/* آواتار کاربر یا پشتیبان */}
                <div
                  className={cn(
                    'h-8 w-8 rounded-full border flex items-center justify-center shrink-0 mb-1 shadow-2xs',
                    isMyMsg
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-muted border-border/80 text-muted-foreground'
                  )}
                >
                  {isMyMsg ? <User className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  {/* نام فرستنده */}
                  <span
                    className={cn(
                      'text-2xs font-bold text-muted-foreground px-1',
                      isMyMsg ? 'text-right' : 'text-left'
                    )}
                  >
                    {msg.senderName}
                  </span>

                  {/* حباب پیام */}
                  <div
                    className={cn(
                      'p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-2xs',
                      isMyMsg
                        ? 'bg-primary text-primary-foreground rounded-tr-xs'
                        : 'bg-muted/70 dark:bg-muted text-foreground border border-border/80 rounded-tl-xs'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* زمان و تیک خوانده‌شدن داخل حباب */}
                    <div
                      className={cn(
                        'mt-2 flex items-center gap-1.5 text-3xs font-medium',
                        isMyMsg ? 'text-primary-foreground/75 justify-end' : 'text-muted-foreground justify-start'
                      )}
                    >
                      <span>{msg.createDateFormatted}</span>
                      {isMyMsg && (
                        <CheckCheck
                          className={cn(
                            'h-3.5 w-3.5',
                            msg.isRead ? 'text-sky-300' : 'text-primary-foreground/60'
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* فایل‌های ضمیمه پیام */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div
                      className={cn(
                        'flex flex-wrap gap-2 mt-1',
                        isMyMsg ? 'justify-start' : 'justify-end'
                      )}
                    >
                      {msg.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={getFullUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 h-8 px-3 rounded-xl border border-border/80 bg-card text-2xs font-bold text-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-2xs"
                        >
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate max-w-[100px]">
                            فایل ضمیمه {toPersianDigits(index + 1)}
                          </span>
                          <Download className="h-3.5 w-3.5 opacity-60 shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Headphones className="h-10 w-10 opacity-30 mb-2" />
            <span className="text-xs font-semibold">هنوز پیامی در این گفتگو ثبت نشده است.</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ================= نوار ارسال پاسخ در پایین ================= */}
      {ticket.status !== 'Closed' ? (
        <div className="border-t border-border/80 bg-card p-3 sm:p-4 shrink-0 flex flex-col gap-3 relative z-10 w-full shadow-lg">
          {/* پیش‌نمایش فایل‌های انتخاب‌شده برای آپلود */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 overflow-x-auto py-1 shrink-0 no-scrollbar">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex h-8 items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-2.5 text-2xs font-bold text-foreground max-w-[140px] shrink-0"
                >
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-0.5 hover:bg-muted rounded-full text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2 w-full items-end">
            {/* دکمه انتخاب فایل */}
            <label
              className="h-10 w-10 border border-border/80 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all shrink-0 cursor-pointer shadow-xs flex items-center justify-center"
              title="پیوست تصویر یا مدارک"
            >
              <Paperclip className="h-5 w-5" />
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* کادر متن پیام */}
            <div className="flex-1 min-w-0">
              <TextArea
                placeholder="پاسخ خود را اینجا بنویسید..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[40px] max-h-28 py-2 px-3 text-xs leading-relaxed border-border/80 rounded-xl focus:border-primary"
                rows={1}
                required
              />
            </div>

            {/* دکمه ارسال پیام */}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={sendMessage.isPending}
              className="rounded-xl h-10 w-10 shrink-0 p-0 flex items-center justify-center shadow-xs"
              aria-label="ارسال پاسخ"
            >
              {!sendMessage.isPending && <Send className="h-4 w-4 transform rotate-180" />}
            </Button>
          </form>
        </div>
      ) : (
        <div className="border-t border-border/80 bg-muted/30 p-3.5 text-center text-xs font-semibold text-muted-foreground shrink-0">
          این پرونده پشتیبانی بسته شده است و امکان ارسال پاسخ جدید وجود ندارد.
        </div>
      )}
    </div>
  );
}