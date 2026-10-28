// src/app/(public)/template.tsx
'use client';

import { PageTransition } from '@/shared/Transitions/PageTransition';

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}