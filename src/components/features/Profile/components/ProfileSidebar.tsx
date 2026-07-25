'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  Headphones, 
  Wallet, 
  Heart, 
  MapPin, 
  MessageSquare, 
  Bell, 
  Eye, 
  Settings, 
  LogOut, 
  Copy, 
  Share2,
  ChevronLeft
} from 'lucide-react';
import { Card } from '@/components/composites/Card';
import { useAuth } from '@/domains/auth/hooks/auth.hooks';
import { useGetWalletBalances } from '@/domains/userpanel/hooks/userpanel.hooks';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

export function ProfileSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();
  const { data: wallet } = useGetWalletBalances();

  const getActiveTab = () => {
    if (pathname.includes('/orders')) return 'orders';
    if (pathname.includes('/support')) return 'support';
    if (pathname.includes('/wallet')) return 'wallet';
    if (pathname.includes('/favorites')) return 'favorites';
    if (pathname.includes('/addresses')) return 'addresses';
    if (pathname.includes('/comments')) return 'comments';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTab();
  const isDashboard = pathname === '/profile';

  const handleLogout = async () => {
    try {
      await logout(undefined);
      showToast.success('با موفقیت از حساب کاربری خود خارج شدید');
      router.push('/');
    } catch (error) {}
  };

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showToast.success('کد معرف شما با موفقیت کپی شد');
    }
  };

  const handleShareReferral = () => {
    if (user?.referralCode && typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'کد معرف یدک‌چی',
        text: `با ثبت کد معرف من در خرید اول خود تخفیف بگیرید. کد معرف: ${user.referralCode}`,
        url: window.location.origin
      }).catch(() => {});
    } else {
      handleCopyReferral();
    }
  };

  const handleWithdraw = () => {
    router.push('/profile/wallet?action=withdraw');
  };

  const menuItems = [
    { id: 'orders', label: 'سفارش‌های من', icon: ShoppingBag, href: '/profile/orders' },
    { id: 'support', label: 'پشتیبانی', icon: Headphones, href: '/profile/support' },
    { id: 'wallet', label: 'کیف پول من', icon: Wallet, href: '/profile/wallet' },
    { id: 'favorites', label: 'کالاها و فروشگاه‌های محبوب من', icon: Heart, href: '/profile/favorites' },
    { id: 'addresses', label: 'آدرس‌های من', icon: MapPin, href: '/profile/addresses' },
    { id: 'comments', label: 'نظرات و پرسش‌ها', icon: MessageSquare, href: '/profile/comments' },
    { id: 'notifications', label: 'پیام‌ها', icon: Bell, href: '/profile/notifications' },
    { id: 'history', label: 'آخرین کالاهای دیده شده', icon: Eye, href: '/profile/history' },
    { id: 'settings', label: 'اطلاعات حساب کاربری', icon: Settings, href: '/profile/settings' },
  ];

  return (
    <div className="w-full flex flex-col gap-5 text-right select-none" dir="rtl">
      
      <div className={cn(
        "w-full flex-col gap-4", 
        isDashboard ? "flex" : "hidden lg:flex"
      )}>
        <Card className="w-full border rounded-xl p-4 bg-background flex items-center justify-between gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground font-iran-sans mb-1">موجودی کیف پول:</span>
            <span className="text-sm font-black text-foreground font-iran-sans">{wallet?.totalBalance || '۰ تومان'}</span>
          </div>
          <button
            onClick={handleWithdraw}
            className="text-[10px] font-bold font-iran-sans text-primary border-b border-primary pb-0.5 hover:text-primary/80 transition-colors outline-none"
          >
            برداشت موجودی
          </button>
        </Card>

        {user?.referralCode && (
          <Card className="w-full border rounded-xl p-4 bg-background flex flex-col gap-3">
            <div className="flex items-center justify-between w-full border-b border-dashed pb-2">
              <span className="text-[10px] font-bold text-muted-foreground font-iran-sans">کد معرف شما:</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-foreground font-iran-sans tracking-widest">{user.referralCode}</span>
                <button onClick={handleCopyReferral} className="text-primary hover:scale-105 transition-transform" aria-label="Copy">
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={handleShareReferral} className="text-primary hover:scale-105 transition-transform" aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[9px] leading-relaxed text-muted-foreground font-iran-sans text-justify">
              با اشتراک‌گذاری این کد، هم دوستت برای خرید اولش ۱۰۰,۰۰۰ تومان تخفیف می‌گیره و هم خودت ۱۰۰,۰۰۰ تومان اعتبار خرید دریافت می‌کنی.
            </p>
          </Card>
        )}
      </div>

      <Card className="w-full border rounded-xl p-4 bg-background flex flex-col gap-3">
        <div className="flex items-center justify-between border-b pb-3 w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 shrink-0 rounded-full border bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-black text-foreground font-iran-sans">{user?.fullName || user?.lastName || 'کاربر یدک‌چی'}</span>
              <span className="text-[10px] text-muted-foreground font-iran-sans mt-0.5">{user?.userName}</span>
            </div>
          </div>
          <button 
            onClick={() => router.push('/profile/settings')}
            className="text-[10px] font-bold font-iran-sans text-primary border-b border-primary pb-0.5 hover:text-primary/80 transition-colors outline-none"
          >
            ویرایش
          </button>
        </div>

        <div className="flex flex-col gap-1 w-full">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm font-bold font-iran-sans transition-colors outline-none",
                activeTab === item.id 
                  ? "bg-primary/5 text-primary" 
                  : "text-foreground hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </div>
              <ChevronLeft className="h-4 w-4 opacity-50" />
            </button>
          ))}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-bold font-iran-sans text-destructive hover:bg-destructive/5 transition-colors outline-none border-t border-dashed mt-2 pt-3"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </Card>

    </div>
  );
}