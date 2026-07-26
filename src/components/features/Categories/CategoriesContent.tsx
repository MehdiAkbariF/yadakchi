'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMegaMenu } from '@/domains/front/banner/hooks/banner.hooks';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Search, Settings, ArrowLeft } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import Link from 'next/link';

export function CategoriesContent() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useGetMegaMenu();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  if (isLoading) {
    return <PageLoading message="در حال بارگذاری لیست دسته‌بندی‌ها..." />;
  }

  const activeCategory = categories.find(c => c.id === (activeCategoryId || categories[0]?.id)) || categories[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-64px)] pb-safe select-none text-right overflow-hidden bg-background" dir="rtl">
      
      <div className="w-full p-4 border-b bg-background shrink-0 z-10">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="جستجو در دسته‌بندی قطعات یدک‌چی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-muted/20 pl-4 pr-10 text-xs font-iran-yekan text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </form>
      </div>

      <div className="flex-1 min-h-0 flex w-full relative z-0">
        
        <div className="w-24 sm:w-28 shrink-0 bg-zinc-50 dark:bg-zinc-900/30 border-l border-zinc-100 dark:border-zinc-800/80 overflow-y-auto flex flex-col min-h-0 py-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-2 py-4 px-2 text-center transition-all outline-none border-r-2",
                  isActive 
                    ? "bg-background text-primary border-primary font-bold" 
                    : "text-foreground border-transparent hover:bg-muted/40"
                )}
              >
                <div className="w-10 h-10 rounded-full border bg-background flex items-center justify-center overflow-hidden p-1 shrink-0">
                  {cat.icon ? (
                    <img
                      src={getFullUrl(cat.icon)}
                      alt={cat.name}
                      className="w-full h-full object-contain filter dark:invert"
                    />
                  ) : (
                    <Settings className="h-5 w-5 text-muted-foreground/80" />
                  )}
                </div>
                <span className="text-[10px] md:text-xs leading-relaxed font-iran-yekan font-bold block max-w-full truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-background no-scrollbar">
          {activeCategory ? (
            <div className="flex flex-col gap-5 w-full">
              
              <div className="flex items-center justify-between  pb-2 w-full">
                <span className="text-xs font-black text-foreground font-iran-yekan">همه قطعات {activeCategory.name}</span>
                <Link 
                  href={activeCategory.href}
                  className="text-[10px] md:text-xs text-primary font-bold
                   font-iran-yekan flex items-center gap-0.5 hover:underline"
                >
                  <span>مشاهده همه</span>
                  <ArrowLeft className="h-3 w-3" />
                </Link>
              </div>

              {activeCategory.parts && activeCategory.parts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3.5 w-full">
                  {activeCategory.parts.map((part) => (
                    <Link
                      key={part.id}
                      href={part.href}
                      className="flex flex-col items-center justify-center text-center p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-background hover:border-primary/20 transition-all select-none gap-2.5 h-28"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted/15 flex items-center justify-center overflow-hidden shrink-0">
                        {part.icon ? (
                          <img 
                            src={getFullUrl(part.icon)} 
                            className="w-full h-full object-contain filter dark:invert" 
                            alt="" 
                          />
                        ) : (
                          <Settings className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold font-iran-yekan text-foreground leading-relaxed line-clamp-2 w-full">{part.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-iran-yekan py-4">قطعه‌ای برای این دسته‌بندی ثبت نشده است.</span>
              )}

            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-iran-yekan">
              یک دسته‌بندی را انتخاب کنید
            </div>
          )}
        </div>

      </div>

    </div>
  );
}