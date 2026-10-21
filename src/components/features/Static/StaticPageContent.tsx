'use client';

import * as React from 'react';
import { FileText } from 'lucide-react';
import { useGetStaticPage } from '@/domains/front/static/hooks/static.hooks';
import { StaticPageViewModel } from '@/domains/front/static/types/view.types';
import { PageLoading } from '@/components/composites/Loading/PageLoading';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { Card } from '@/components/composites/Card';
import { PuckSchemaRenderer } from '@/domains/front/page-builder/PuckSchemaRenderer';

export interface StaticPageContentProps {
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
    return JSON.parse(content.slice(PUCK_PREFIX.length));
  } catch {
    return null;
  }
}

export function StaticPageContent({ slug, initialPage }: StaticPageContentProps) {
  const {
    data: clientPage,
    isError,
  } = useGetStaticPage(slug, {
    initialData: initialPage,
    staleTime: 15 * 60 * 1000,
  });

  const page = clientPage || initialPage;

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [slug]);

  if (isError && !page) {
    return (
      <div className="w-full py-16 text-center text-sm text-muted-foreground">
        خطا در بارگذاری محتوای صفحه
      </div>
    );
  }

  if (!page) {
    return <PageLoading label="در حال بارگذاری..." />;
  }

  const breadcrumbItems = [{ id: 'static-page-root', title: page.title }];
  const isPuck = isPuckContent(page.content);
  const puckSchema = isPuck ? parsePuckContent(page.content) : null;

  return (
    <main className="flex w-full flex-col gap-6 pb-12">
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      <Card className="w-full overflow-hidden border border-border bg-card shadow-xs">
        <div className="w-full border-b border-border bg-muted/40 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-accent bg-accent text-primary">
              <FileText aria-hidden="true" className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold leading-tight text-foreground">{page.title}</h1>
              <span className="text-2xs text-muted-foreground md:text-xs">
                آخرین به‌روزرسانی: {new Date().toLocaleDateString('fa-IR')}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full p-6 md:p-8">
          {isPuck && puckSchema ? (
            <PuckSchemaRenderer schema={puckSchema} />
          ) : page.content ? (
            <article
              className="prose-static text-justify text-sm leading-reading text-foreground sm:text-base
                [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:opacity-80
                [&_blockquote]:my-4 [&_blockquote]:rounded-e-md [&_blockquote]:border-s-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-muted/40 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs
                [&_em]:italic
                [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:border-s-4 [&_h1]:border-primary [&_h1]:ps-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground
                [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-s-2 [&_h2]:border-primary [&_h2]:ps-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground
                [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground
                [&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground
                [&_hr]:my-6 [&_hr]:border-border
                [&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border
                [&_li]:leading-reading [&_li]:text-foreground/90
                [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pe-6 [&_ol]:marker:text-primary
                [&_p]:mb-4 [&_p]:leading-reading [&_p]:text-foreground/90
                [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-xs [&_pre]:leading-relaxed
                [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
                [&_strong]:font-bold [&_strong]:text-foreground
                [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
                [&_td]:border [&_td]:border-border [&_td]:p-2.5
                [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2.5 [&_th]:font-bold
                [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pe-6 [&_ul]:marker:text-primary"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <div className="w-full py-12 text-center text-sm text-muted-foreground">
              محتوایی برای این صفحه ثبت نشده است.
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}