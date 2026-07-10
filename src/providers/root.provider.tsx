// src/providers/root.provider.tsx

'use client';

import { QueryProvider } from './query.provider';
import { ThemeProvider } from './theme.provider';

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}