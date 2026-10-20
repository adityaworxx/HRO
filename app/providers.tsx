'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useUiStore } from '@/lib/store';
import { TooltipProvider } from '@/components/ui/tooltip';

// React 19 / Next.js 16 emits a false-positive development warning for next-themes' inline SSR theme script
if (process.env.NODE_ENV === 'development') {
  const errorFn = console.error as unknown as { __nextThemesScriptPatched?: boolean };
  if (!errorFn.__nextThemesScriptPatched) {
    const origError = console.error;
    const patchedError = (...args: unknown[]) => {
      const hasScriptWarning = args.some(
        (arg) =>
          typeof arg === 'string' &&
          arg.includes('Encountered a script tag while rendering React component')
      );
      if (hasScriptWarning) {
        return;
      }
      origError.apply(console, args);
    };
    (patchedError as unknown as { __nextThemesScriptPatched: boolean }).__nextThemesScriptPatched =
      true;
    console.error = patchedError;
  }
}

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
        <TooltipProvider delayDuration={100}>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
