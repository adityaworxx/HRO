import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HRO - Hiring Requisition & Onboarding',
  description: 'Enterprise hiring requisition and onboarding platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      style={{ zoom: 0.8 }}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html {
                zoom: 0.8 !important;
              }
              [data-radix-popper-content-wrapper] {
                zoom: 1.25 !important;
              }
              [data-radix-popper-content-wrapper] > * {
                zoom: 0.8 !important;
              }
            `,
          }}
        />
      </head>
      <body className="bg-bg text-text flex min-h-full flex-col font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
