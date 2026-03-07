import Link from 'next/link';
import { ArrowLeft, Compass, Home, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="blob left-[-8rem] top-[-6rem] h-72 w-72 bg-primary/20 animate-pulse-glow" />
      <div
        className="blob bottom-[-6rem] right-[-5rem] h-80 w-80 bg-accent/20 animate-pulse-glow"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="blob left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 bg-primary/10 animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12 md:px-6">
        <section className="glass-strong glow-primary w-full max-w-3xl rounded-[2rem] p-8 text-center shadow-2xl md:p-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            The page you requested could not be found
          </div>

          <div className="mb-4 text-7xl font-black tracking-[-0.08em] text-transparent md:text-9xl">
            <span className="text-gradient">404</span>
          </div>

          <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            This route drifted out of the syllabus.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            The link may be outdated, the page may have moved, or the address might be incorrect.
            Use the options below to get back to ScholarSync.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <Button size="lg" className="min-w-44 gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg" variant="outline" className="min-w-44 gap-2 bg-card/50">
                <Compass className="h-4 w-4" />
                Open Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground">Check the URL</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A small typo in the address is often enough to trigger a not-found page.
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground">Return to a known route</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Go back to the landing page or dashboard and continue from a valid link.
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground">Try the previous page</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your browser history may still have the page you were looking for.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Return safely to the main experience
          </Link>
        </section>
      </div>
    </main>
  );
}
