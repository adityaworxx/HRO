'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useUiStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  React.useEffect(() => {
    useUiStore.getState().initFromStorage();
  }, []);

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className:
              'border-border bg-surface-1/95 backdrop-blur-[6px] text-text shadow-xl rounded-[12px] border text-[13px] font-medium py-3 px-4',
            classNames: {
              title: 'text-text text-[13px] font-medium',
              description: 'text-text-muted text-[12px]',
              actionButton: 'bg-accent text-bg font-medium rounded-[var(--radius-sm)]',
              cancelButton: 'bg-surface-2 text-text font-medium rounded-[var(--radius-sm)]',
            },
          }}
        />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
