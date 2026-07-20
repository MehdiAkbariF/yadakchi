'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGetTicketDetails, useSendTicketMessage, useMarkMessagesAsRead } from '@/domains/ticket/hooks/ticket.hooks';
import { Card, CardBody } from '@/components/composites/Card';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Button } from '@/components/primitives/Button/Button';
import { TextArea } from '@/components/primitives/TextArea/TextArea';
import { cn } from '@/design-system/utils/cn';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { ArrowRight, Send, Paperclip, X, FileText, User, Headphones } from 'lucide-react';
import { showToast } from '@/core/utils/toast';

interface TicketDetailsProps {
  ticketId: string;
}

export function TicketDetails({ ticketId }: TicketDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: ticket, isLoading } = useGetTicketDetails(ticketId, user?.id);
  const sendMessage = useSendTicketMessage();
  const readMessages = useMarkMessagesAsRead(ticketId);

  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticket?.messages) {
      const unreadIds = ticket.messages
        .filter(m => !m.isMyMessage)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        readMessages.mutate(unreadIds);
      }
    }
  }, [ticket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (isLoading || !ticket) {
    return <PageLoading message="در حال بازگذاری مکالمات پشتیبانی..." />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray].slice(0, 5));
    }
  };

  const handleRemoveFile = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
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
        text: messageText,
        attachments,
      });

      showToast.success('پاسخ شما با موفقیت ارسال شد');
      setMessageText('');
      setAttachments([]);
    } catch (error: any) {
      showToast.error(error.userMessage || 'خطا در ارسال پاسخ');
    }
  };

  const getFullUrl = (path: any) => {
    if (!path || typeof path !== 'string') return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] select-none text-right -mt-6 -mx-4 md:-mx-6 overflow-hidden bg-background" dir="rtl">
      
      <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/profile/support')}
            className="p-1 -mr-1 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowRight className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-foreground block truncate max-w-[200px] sm:max-w-md">{ticket.title}</span>
            <span className="text-[9px] text-muted-foreground font-iran-sans block mt-0.5">شماره تیکت: {ticket.ticketNumberFormatted}</span>
          </div>
        </div>
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold font-iran-sans shrink-0",
          ticket.status === 'WaitingForAnswer' && "bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400",
          ticket.status === 'Answered' && "bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400",
          ticket.status === 'Closed' && "bg-muted text-muted-foreground"
        )}>
          {ticket.statusLabel}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 no-scrollbar">
        {ticket.messages.length > 0 ? (
          ticket.messages.map((msg) => {
            const isMyMsg = msg.isMyMessage;
            return (
              <div 
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 w-full max-w-[85%] md:max-w-[70%] text-right font-iran-sans",
                  isMyMsg ? "self-start flex-row" : "self-end flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm",
                  isMyMsg ? "bg-primary/10 border-primary/15 text-primary" : "bg-muted border-zinc-200 text-muted-foreground"
                )}>
                  {isMyMsg ? <User className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                </div>

                <div className="flex flex-col gap-1 w-full min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-foreground">{msg.senderName}</span>
                    <span className="text-[8px] text-muted-foreground">{msg.createDateFormatted}</span>
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl shadow-sm text-xs md:text-sm font-medium leading-relaxed break-words",
                    isMyMsg ? "bg-primary text-white rounded-tr-none" : "bg-muted/40 dark:bg-zinc-900 border rounded-tl-none text-foreground"
                  )}>
                    {msg.text}
                  </div>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={cn("flex flex-wrap gap-1.5 mt-1.5", isMyMsg ? "justify-start" : "justify-end")}>
                      {msg.attachments.map((url, index) => (
                        <a 
                          key={index}
                          href={getFullUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-2.5 rounded-lg border bg-background text-[9px] font-bold text-foreground flex items-center gap-1.5 shadow-sm hover:border-primary/20"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[80px]">فایل ضمیمه {formatPrice(index + 1)}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <span className="text-xs text-muted-foreground font-iran-sans py-4">پیامی ثبت نشده است.</span>
        )}
        <div ref={messagesEndRef} />
      </div>

      {ticket.status !== 'Closed' && (
        <div className="border-t bg-background p-4 shrink-0 flex flex-col gap-3.5 relative z-10 w-full shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 overflow-x-auto py-0.5 shrink-0 no-scrollbar">
              {attachments.map((file, idx) => (
                <div 
                  key={idx}
                  className="h-8 px-2.5 rounded-lg border bg-muted/20 text-[9px] font-bold font-iran-sans text-foreground flex items-center gap-1.5 shrink-0 max-w-[120px]"
                >
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate flex-1 text-right">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-0.5 hover:bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2 w-full items-end">
            <label className="h-10 w-10 border rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all shrink-0 cursor-pointer shadow-sm flex items-center justify-center p-2.5">
              <Paperclip className="h-4.5 w-4.5" />
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="flex-1 min-w-0">
              <TextArea
                placeholder="پاسخ خود را اینجا بنویسید..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="h-10 py-2.5 text-xs leading-normal"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={sendMessage.isPending}
              className="rounded-xl h-10 w-10 shrink-0 p-2.5 flex items-center justify-center shadow-md shadow-primary/10"
              aria-label="Send"
            >
              {!sendMessage.isPending && <Send className="h-4 w-4 transform rotate-180" />}
            </Button>
          </form>
        </div>
      )}

    </div>
  );
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('fa-IR').format(value);
};