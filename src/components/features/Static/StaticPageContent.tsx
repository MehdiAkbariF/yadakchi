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

type ParsedContent =
  | { type: 'puck'; schema: any }
  | { type: 'htmlDoc'; html: string; css: string }
  | { type: 'rawHtml'; html: string }
  | null;

interface ExtractedDoc {
  styles: string[];
  bodyHtml: string;
  scripts: string[];
  lang: string;
  dir: string;
}

const PUCK_PREFIX = '__PUCK__:';

const DARK_MODE_CSS = `
.dark [data-static-scope] { color-scheme: dark; }

.dark [data-static-scope],
.dark [data-static-scope] body {
  background: #0b1220 !important;
  color: #e5e7eb !important;
}

.dark [data-static-scope] .hero {
  background: #10202e !important;
  color: #f3f4f6 !important;
}
.dark [data-static-scope] .hero p,
.dark [data-static-scope] .hero-meta { color: #b8c4cf !important; }
.dark [data-static-scope] .hero-meta strong,
.dark [data-static-scope] .eyebrow { color: #7dd3fc !important; }

.dark [data-static-scope] .top {
  background: #0f1b2aee !important;
  border-bottom-color: #1f2d3d !important;
}
.dark [data-static-scope] .top-link {
  background: #16263a !important;
  border-color: #24384f !important;
  color: #cbd5e1 !important;
}
.dark [data-static-scope] .top-label { color: #94a3b8 !important; }
.dark [data-static-scope] .separator { background: #24384f !important; }

.dark [data-static-scope] .toc {
  background: #121f2e !important;
  border-color: #1f2d3d !important;
}
.dark [data-static-scope] .toc h2 { color: #e2e8f0 !important; }
.dark [data-static-scope] .toc a { color: #94a3b8 !important; }
.dark [data-static-scope] .toc a:hover { background: #16263a !important; color: #cbd5e1 !important; }
.dark [data-static-scope] .toc a.active {
  background: #1e3a52 !important;
  color: #7dd3fc !important;
  border-right-color: #38bdf8 !important;
}
.dark [data-static-scope] .toc a.active span { color: #7dd3fc !important; }
.dark [data-static-scope] .toc a span { color: #64748b !important; }
.dark [data-static-scope] .mobile-toc { background: #16263a !important; color: #7dd3fc !important; }
.dark [data-static-scope] .side-note { background: #16263a !important; color: #b8c4cf !important; }
.dark [data-static-scope] .side-note strong { color: #7dd3fc !important; }

.dark [data-static-scope] .intro {
  background: #121f2e !important;
  border-color: #1f2d3d !important;
}
.dark [data-static-scope] .intro p { color: #b8c4cf !important; }
.dark [data-static-scope] .intro .intro-foot { color: #94a3b8 !important; }
.dark [data-static-scope] .chips span {
  background: #16263a !important;
  border-color: #24384f !important;
  color: #cbd5e1 !important;
}

.dark [data-static-scope] .step {
  background: #121f2e !important;
  border-color: #1f2d3d !important;
}
.dark [data-static-scope] .step-head h2 { color: #e2e8f0 !important; }
.dark [data-static-scope] .step-head small,
.dark [data-static-scope] .count { color: #94a3b8 !important; }
.dark [data-static-scope] .number {
  background: #1e3a52 !important;
  border-color: #2c4a66 !important;
  color: #7dd3fc !important;
}
.dark [data-static-scope] .step figure {
  background: #0f1b2a !important;
  border-color: #1f2d3d !important;
}
.dark [data-static-scope] .image-button { background: #0b1220 !important; }
.dark [data-static-scope] .step figcaption {
  color: #94a3b8 !important;
  border-top-color: #1f2d3d !important;
}
.dark [data-static-scope] .step figcaption button { color: #7dd3fc !important; }
.dark [data-static-scope] .step-body strong { color: #e2e8f0 !important; }
.dark [data-static-scope] .step-body li::marker { color: #38bdf8 !important; }

.dark [data-static-scope] dl { background: #0f1b2a !important; border-color: #1f2d3d !important; }
.dark [data-static-scope] dt { color: #cbd5e1 !important; }
.dark [data-static-scope] dd { color: #94a3b8 !important; border-bottom-color: #1f2d3d !important; }

.dark [data-static-scope] .note {
  background: #16263a !important;
  color: #b8c4cf !important;
  border-right-color: #38bdf8 !important;
}
.dark [data-static-scope] .note.warning {
  background: #3a2a12 !important;
  color: #fcd34d !important;
  border-color: #b45309 !important;
}

.dark [data-static-scope] .finish { background: #0f1b2a !important; color: #b8c4cf !important; }
.dark [data-static-scope] .finish b { color: #f3f4f6 !important; }
.dark [data-static-scope] .finish-icon { color: #7dd3fc !important; border-color: #24384f !important; }

.dark [data-static-scope] footer { border-top-color: #1f2d3d !important; color: #94a3b8 !important; }
.dark [data-static-scope] footer a { color: #7dd3fc !important; }

.dark [data-static-scope] dialog { background: #121f2e !important; box-shadow: 0 20px 90px #0009 !important; }
.dark [data-static-scope] dialog::backdrop { background: #000a !important; }
.dark [data-static-scope] .modal-head {
  background: #121f2e !important;
  border-bottom-color: #1f2d3d !important;
}
.dark [data-static-scope] .close {
  background: #16263a !important;
  border-color: #24384f !important;
  color: #cbd5e1 !important;
}

.dark [data-static-scope] .reading-progress { background: #38bdf8 !important; }
.dark [data-static-scope] a { color: #7dd3fc; }
`;

function parseContent(content: string | null | undefined): ParsedContent {
  if (!content || typeof content !== 'string') return null;

  if (content.startsWith(PUCK_PREFIX)) {
    try {
      return { type: 'puck', schema: JSON.parse(content.slice(PUCK_PREFIX.length)) };
    } catch {
      return null;
    }
  }

  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.html === 'string') {
        return {
          type: 'htmlDoc',
          html: parsed.html,
          css: typeof parsed.css === 'string' ? parsed.css : '',
        };
      }
    } catch {
      // not JSON
    }
  }

  return { type: 'rawHtml', html: content };
}

/**
 * استخراج محتوا از سند کامل HTML.
 *
 * - هدر سند (header.top) نگه داشته می‌شود
 * - فوتر، skip link، script، link، meta حذف می‌شوند
 */
function extractContentFromDoc(htmlDoc: string): ExtractedDoc {
  const doc = new DOMParser().parseFromString(htmlDoc, 'text/html');

  const styles: string[] = [];
  doc.querySelectorAll('style').forEach((el) => {
    if (el.textContent) styles.push(el.textContent);
  });

  const scripts: string[] = [];
  doc.querySelectorAll('script').forEach((el) => {
    if (!el.getAttribute('src') && el.textContent) {
      scripts.push(el.textContent);
    }
  });

  // ⭐ فقط فوتر، skip link، script، link، meta حذف می‌شوند
  // هدر سند (header.top) و dialog (lightbox) نگه داشته می‌شوند
  const removeSelectors = ['footer', '.skip', 'script', 'link', 'meta'];
  removeSelectors.forEach((sel) => {
    doc.querySelectorAll(sel).forEach((el) => el.remove());
  });

  const bodyHtml = doc.body.innerHTML;
  const lang = doc.documentElement.getAttribute('lang') || 'fa';
  const dir = doc.documentElement.getAttribute('dir') || 'rtl';

  return { styles, bodyHtml, scripts, lang, dir };
}

export function StaticPageContent({ slug, initialPage }: StaticPageContentProps) {
  const { data: clientPage, isError } = useGetStaticPage(slug, {
    initialData: initialPage,
    staleTime: 15 * 60 * 1000,
  });

  const page = clientPage || initialPage;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [extracted, setExtracted] = React.useState<ExtractedDoc | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  const parsed = React.useMemo(() => parseContent(page?.content), [page?.content]);

  React.useEffect(() => {
    if (!parsed || parsed.type !== 'htmlDoc') {
      setExtracted(null);
      return;
    }
    setExtracted(extractContentFromDoc(parsed.html));
  }, [parsed]);

  // تزریق استایل سند
  React.useEffect(() => {
    if (!extracted || !page) return;
    const scopeId = `static-page-${page.id}`;
    const styleEls: HTMLStyleElement[] = [];

    const push = (css: string) => {
      const el = document.createElement('style');
      el.setAttribute('data-static-scope-style', scopeId);
      el.textContent = `[data-static-scope="${scopeId}"] { ${css} }`;
      document.head.appendChild(el);
      styleEls.push(el);
    };

    extracted.styles.forEach(push);
    if (parsed && parsed.type === 'htmlDoc' && parsed.css) push(parsed.css);

    return () => styleEls.forEach((el) => el.remove());
  }, [extracted, parsed, page]);

  // تزریق CSS دارک مود
  React.useEffect(() => {
    const DARK_STYLE_ID = 'static-page-dark-mode';
    if (document.getElementById(DARK_STYLE_ID)) return;

    const el = document.createElement('style');
    el.id = DARK_STYLE_ID;
    el.textContent = DARK_MODE_CSS;
    document.head.appendChild(el);
  }, []);

  // اجرای اسکریپت‌های سند
  React.useEffect(() => {
    if (!extracted || !containerRef.current) return;
    const root = containerRef.current;
    const scriptEls: HTMLScriptElement[] = [];

    extracted.scripts.forEach((code) => {
      const el = document.createElement('script');
      el.setAttribute('data-static-page-script', 'true');
      el.textContent = `(function(){ try { ${code} } catch(e){ console.warn('[static-page script]', e); } })();`;
      root.appendChild(el);
      scriptEls.push(el);
    });

    return () => scriptEls.forEach((el) => el.remove());
  }, [extracted]);

  // مدیریت کلیک روی لینک‌های href="#..."
  React.useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const id = href.slice(1);
      const el = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    };

    root.addEventListener('click', handleClick);
    return () => root.removeEventListener('click', handleClick);
  }, [extracted]);

  // ⭐ اصلاح sticky هدر سند برای جلوگیری از تداخل با هدر سایت
  React.useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;
    const topHeader = root.querySelector<HTMLElement>('.top');
    if (!topHeader) return;

    // هدر سند را relative می‌کنیم تا روی هدر سایت نیفتد
    topHeader.style.position = 'relative';
    topHeader.style.top = '0';
    topHeader.style.zIndex = '1';
  }, [extracted]);

  if (isError && !page) {
    return (
      <div className="w-full py-16 text-center text-sm text-muted-foreground">
        خطا در بارگذاری محتوای صفحه
      </div>
    );
  }

  if (!page) return <PageLoading label="در حال بارگذاری..." />;

  const breadcrumbItems = [{ id: 'static-page-root', title: page.title }];

  if (parsed?.type === 'puck') {
    return (
      <main className="flex w-full flex-col gap-6 pb-12">
        <nav aria-label="مسیر جاری">
          <Breadcrumb items={breadcrumbItems} />
        </nav>
        <Card className="w-full overflow-hidden border border-border bg-card shadow-xs">
          <div className="w-full border-b border-border bg-muted/40 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-accent bg-accent text-primary">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold leading-tight text-foreground">{page.title}</h1>
              </div>
            </div>
          </div>
          <div className="w-full p-6 md:p-8">
            <PuckSchemaRenderer schema={parsed.schema} />
          </div>
        </Card>
      </main>
    );
  }

  if (parsed?.type === 'htmlDoc' && extracted) {
    return (
      <main className="flex w-full flex-col gap-6 pb-12">
        <nav aria-label="مسیر جاری">
          <Breadcrumb items={breadcrumbItems} />
        </nav>
        <Card className="w-full overflow-hidden border border-border bg-card shadow-xs">
          <div
            ref={containerRef}
            data-static-scope={`static-page-${page.id}`}
            dir={extracted.dir}
            lang={extracted.lang}
            className="static-page-content w-full"
            dangerouslySetInnerHTML={{ __html: extracted.bodyHtml }}
          />
        </Card>
      </main>
    );
  }

  if (parsed?.type === 'rawHtml' && parsed.html) {
    return (
      <main className="flex w-full flex-col gap-6 pb-12">
        <nav aria-label="مسیر جاری">
          <Breadcrumb items={breadcrumbItems} />
        </nav>
        <Card className="w-full overflow-hidden border border-border bg-card shadow-xs">
          <div className="w-full border-b border-border bg-muted/40 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-accent bg-accent text-primary">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold leading-tight text-foreground">{page.title}</h1>
              </div>
            </div>
          </div>
          <div className="w-full p-6 md:p-8">
            <article
              className="prose-static text-justify text-sm leading-reading text-foreground sm:text-base
                [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4
                [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold
                [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold
                [&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border
                [&_p]:mb-4 [&_p]:leading-reading
                [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pe-6"
              dangerouslySetInnerHTML={{ __html: parsed.html }}
            />
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-6 pb-12">
      <nav aria-label="مسیر جاری">
        <Breadcrumb items={breadcrumbItems} />
      </nav>
      <Card className="w-full overflow-hidden border border-border bg-card shadow-xs">
        <div className="w-full p-6 md:p-8">
          <div className="w-full py-12 text-center text-sm text-muted-foreground">
            محتوایی برای این صفحه ثبت نشده است.
          </div>
        </div>
      </Card>
    </main>
  );
}