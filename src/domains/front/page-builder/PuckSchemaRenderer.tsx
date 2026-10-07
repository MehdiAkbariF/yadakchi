// src/domains/front/page-builder/PuckSchemaRenderer.tsx

'use client';

import dynamic from 'next/dynamic';
import { puckConfig } from './config/puck.config';

// ✅ Puck رو به صورت dynamic import کن تا از SSR issues جلوگیری بشه
const PuckRender = dynamic(
  () => import('@measured/puck').then((mod) => ({ default: mod.Render })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-iran-yekan">
          در حال بارگذاری محتوا...
        </span>
      </div>
    ),
  }
);

interface PuckSchemaRendererProps {
  schema: any;
}

export function PuckSchemaRenderer({ schema }: PuckSchemaRendererProps) {
  if (!schema || !schema.content || schema.content.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground font-iran-yekan text-sm">
        محتوایی برای این صفحه ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="puck-renderer-wrapper">
      <PuckRender config={puckConfig} data={schema} />
    </div>
  );
}