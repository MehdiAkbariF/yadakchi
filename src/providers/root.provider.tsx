// src/providers/root.provider.tsx

'use client';

import { QueryProvider } from './query.provider';

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}