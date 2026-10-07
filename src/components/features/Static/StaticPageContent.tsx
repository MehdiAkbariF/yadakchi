// src/components/features/Static/StaticPageContent.tsx

'use client';

import { useEffect } from 'react';
import { useGetStaticPage } from '@/domains/front/static/hooks/static.hooks';
import { StaticPageViewModel } from '@/domains/front/static/types/view.types';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Card } from '@/components/composites/Card';
import { FileText } from 'lucide-react';
import { PuckSchemaRenderer } from '@/domains/front/page-builder/PuckSchemaRenderer';

interface StaticPageContentProps {
  slug: string;
  initialPage: StaticPageViewModel;
}

const PUCK_PREFIX = '__PUCK__:';

function isPuckContent(content: string): boolean {
  return typeof content === 'string' && content.startsWith(PUCK_PREFIX);
}

function parsePuckContent(content: string): any | null {
  if (!isPuckContent(content)) return null;
  try {
    const raw = content.slice(PUCK_PREFIX.length);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function StaticPageContent({
  slug,
  initialPage,
}: StaticPageContentProps) {
  const {
    data: clientPage,
    isLoading,
    isError,
  } = useGetStaticPage(slug, {
    initialData: initialPage,
    staleTime: 15 * 60 * 1000,
  });

  const page = clientPage || initialPage;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [slug]);

  if (isError && !page) {
    return (
      <div className="w-full py-16 text-center text-muted-foreground font-iran-yekan text-sm">
        خطا در بارگذاری محتوای صفحه
      </div>
    );
  }

  if (!page) {
    return <PageLoading message="در حال بارگذاری..." />;
  }

  const breadcrumbItems = [{ id: 'static-page-root', title: page.title }];

  // ✅ تشخیص: Puck یا HTML؟
  const isPuck = isPuckContent(page.content);
  const puckSchema = isPuck ? parsePuckContent(page.content) : null;

  return (
    <main className="w-full flex flex-col gap-6 pb-12 text-right" dir="rtl">
      {/* Breadcrumb */}
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      {/* کارت اصلی */}
      <Card className="w-full border rounded-2xl bg-card shadow-sm overflow-hidden">
        {/* هدر صفحه */}
        <div className="w-full bg-gradient-to-l from-primary/5 via-primary/10 to-transparent border-b border-zinc-100 dark:border-zinc-800 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-right gap-1">
              <h1 className="text-xl md:text-2xl font-black text-foreground font-iran-yekan leading-tight">
                {page.title}
              </h1>
              <span className="text-[10px] md:text-xs text-muted-foreground font-iran-yekan">
                آخرین به‌روزرسانی: {new Date().toLocaleDateString('fa-IR')}
              </span>
            </div>
          </div>
        </div>

        {/* محتوا */}
        <div className="w-full p-6 md:p-8">
          {isPuck && puckSchema ? (
            // ✅ Puck Schema → رندر با Puck
            <PuckSchemaRenderer schema={puckSchema} />
          ) : page.content ? (
            // ✅ HTML قدیمی → رندر با dangerouslySetInnerHTML
            <article
              className="
                prose-static
                text-sm sm:text-base leading-loose text-justify
                [&_h1]:text-xl sm:[&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:border-r-4 [&_h1]:border-primary [&_h1]:pr-3
                [&_h2]:text-lg sm:[&_h2]:text-xl [&_h2]:font-black [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-r-2 [&_h2]:border-primary [&_h2]:pr-3
                [&_h3]:text-base sm:[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2
                [&_h4]:text-sm sm:[&_h4]:text-base [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-5 [&_h4]:mb-2
                [&_p]:mb-4 [&_p]:leading-loose [&_p]:text-foreground/90
                [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:marker:text-primary
                [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:mb-4 [&_ol]:space-y-2 [&_ol]:marker:text-primary
                [&_li]:leading-loose [&_li]:text-foreground/90
                [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:opacity-80
                [&_img]:rounded-xl [&_img]:border [&_img]:border-border/60 [&_img]:my-6 [&_img]:w-full [&_img]:h-auto
                [&_blockquote]:border-r-4 [&_blockquote]:border-primary/40 [&_blockquote]:pr-4 [&_blockquote]:py-1 [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:bg-muted/30 [&_blockquote]:rounded-l-lg
                [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:leading-relaxed
                [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-mono
                [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
                [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_table]:text-sm
                [&_th]:border [&_th]:border-border [&_th]:p-2.5 [&_th]:bg-muted/50 [&_th]:font-bold [&_th]:text-right
                [&_td]:border [&_td]:border-border [&_td]:p-2.5 [&_td]:text-right
                [&_hr]:my-6 [&_hr]:border-border
                [&_strong]:font-bold [&_strong]:text-foreground
                [&_em]:italic
              "
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <div className="w-full py-12 text-center text-muted-foreground font-iran-yekan text-sm">
              محتوایی برای این صفحه ثبت نشده است.
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}