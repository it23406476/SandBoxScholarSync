import Link from 'next/link';
import { ArrowLeft, Compass, Home, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-foreground">
      <div className="blob -left-32 -top-24 h-72 w-72 bg-primary/20 animate-pulse-glow" />
      <div
        className="blob -bottom-24 -right-20 h-80 w-80 bg-accent/20 animate-pulse-glow"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="blob left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 bg-primary/10 animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />

      <div className="relative mx-auto flex w-full max-w-xl items-center justify-center px-2 py-4 md:px-4">
        <section className="glass-strong glow-primary w-full rounded-2xl p-4 text-center shadow-2xl md:p-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            The page you requested could not be found
          </div>

          <div className="mb-2 text-5xl font-black tracking-[-0.08em] text-transparent md:text-7xl">
            <span className="text-gradient">404</span>
          </div>

          <h1 className="mx-auto max-w-xl text-xl font-bold tracking-tight text-foreground md:text-2xl">
            This route drifted out of the syllabus.
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
            The link may be outdated, the page may have moved, or the address might be incorrect.
            Use the options below to get back to ScholarSync.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link href="/">
              <Button size="sm" className="min-w-32 gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/student">
              <Button size="sm" variant="outline" className="min-w-32 gap-2 bg-card/50">
                <Compass className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to ScholarSync
          </Link>
        </section>
      </div>
    </main>
  );
}
