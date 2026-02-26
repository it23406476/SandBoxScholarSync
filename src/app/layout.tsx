import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* RESPONSIVE WRAPPER */}
          <div className="flex min-h-screen w-full flex-col md:flex-row">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden w-64 border-r bg-muted/20 md:block">
              <div className="flex h-full flex-col p-4">
                <h1 className="text-2xl font-bold text-primary mb-8">ScholarSync</h1>
                {/* Navigation Links will go here */}
                <nav className="space-y-2 text-sm font-medium">
                  <div>Home</div>
                  <div>Q&A Hub</div>
                  <div>Forum</div>
                </nav>
              </div>
            </aside>

            {/* Mobile Top Navbar (Hidden on Desktop) */}
            <header className="flex h-14 items-center border-b bg-muted/20 px-4 md:hidden">
              <h1 className="text-xl font-bold text-primary">ScholarSync</h1>
            </header>

            {/* Main Content Area (Where your team's pages load) */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
