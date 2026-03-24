import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { ClientLayout } from '../components/shared/ClientLayout';
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScholarSync | Academic Hub',
  description: 'Intelligent Q&A and Knowledge Sharing Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* This renders your Sidebars, Navs, and the Page Content */}
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
