// ScholarSync Landing Page - Demo change for commit 1
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Star,
  Globe,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

import { features, steps, testimonials, stats, moduleList } from './data/dummyData';

function MarqueeModules() {
  // Duplicate the list for seamless looping
  const items = [...moduleList, ...moduleList];
  return (
    <div
      className="group/marquee flex w-max gap-4 animate-marquee hover:paused"
      style={{ animationDuration: '50s' }}
    >
      {items.map((mod, i) => (
        <div
          key={mod + i}
          className="shrink-0 glass rounded-full px-5 py-2.5 text-sm font-medium text-foreground/80 whitespace-nowrap hover:text-primary transition-colors cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
          {mod}
        </div>
      ))}
    </div>
  );
}

function MarqueeModule() {
  // Duplicate the list for seamless looping
  const items = [...moduleList, ...moduleList];
  return (
    <div
      className="group/marquee flex w-max gap-4 animate-marquee-reverse hover:paused"
      style={{ animationDuration: '50s' }}
    >
      {items.map((mod, i) => (
        <div
          key={mod + i}
          className="shrink-0 glass rounded-full px-5 py-2.5 text-sm font-medium text-foreground/80 whitespace-nowrap hover:text-primary transition-colors cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
          {mod}
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* ── Navbar ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="container mx-auto flex items-center justify-between gap-3 py-3 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold whitespace-nowrap">
              <span className="text-primary">Scholar</span>
              <span className="text-accent">Sync</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1 shadow-md">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative gradient-hero text-primary-foreground py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Decorative blobs */}
        <div className="blob w-125 h-125 bg-accent/30 -top-40 -left-40 animate-pulse-glow" />
        <div
          className="blob w-100 h-100 bg-primary-foreground/10 bottom-0 right-0 animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="blob w-75 h-75 bg-accent/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow"
          style={{ animationDelay: '3s' }}
        />

        <div className="container relative mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-hero text-sm mb-8 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-primary-foreground/90">
                Trusted by thousands of university students
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 animate-slide-up">
              Where Students &amp;{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Lecturers</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-accent/40 rounded-sm z-0" />
              </span>{' '}
              Connect Through <span className="text-accent">Knowledge</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-primary-foreground/75 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up"
              style={{ animationDelay: '0.15s' }}
            >
              A module-based academic Q&amp;A platform built for universities. Ask questions, share
              knowledge, earn reputation&nbsp;&mdash; all in one beautifully simple place.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:-translate-y-0.5 text-base px-8 h-12"
                >
                  Join ScholarSync
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full glass-hero text-primary-foreground hover:bg-primary-foreground/10 transition-all hover:-translate-y-0.5 text-base px-8 h-12"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div
              className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/60 animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              {['Free for students', 'No credit card required', 'University verified'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────── */}
      <section className="relative -mt-10 z-10 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="glass-strong rounded-2xl shadow-xl p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="animate-count-up"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <p className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── Features ─────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-sm font-semibold text-accent mb-3 tracking-wider uppercase">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Excel</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Built for academic collaboration, ScholarSync brings together all the tools students
              and lecturers need in one sleek platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-linear-to-br ${f.color} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}
                >
                  <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── How It Works ─────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/40 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-sm font-semibold text-accent mb-3 tracking-wider uppercase">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              From sign-up to your first answer, it takes less than two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="relative glass rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Number badge */}
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground text-xl font-bold mb-5 shadow-lg shadow-primary/20">
                  {s.num}
                </div>

                {/* Connector line (hidden on last item & mobile) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-18 -right-4 w-8 border-t-2 border-dashed border-primary/30" />
                )}

                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Testimonials ─────────────────────────────── */}
      <section id="testimonials" className="py-20 md:py-28 scroll-mt-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-block text-sm font-semibold text-accent mb-3 tracking-wider uppercase">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="text-gradient">Students &amp; Lecturers</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Hear from members of the ScholarSync community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="glass rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed mb-6 flex-1 italic text-foreground/85">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Popular Modules (Marquee) ────────────────── */}
      <section className="py-14 bg-muted/40 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 text-center mb-8">
          <span className="text-sm font-semibold text-accent tracking-wider uppercase">
            Popular Modules
          </span>
        </div>
        <div
          className="relative w-full overflow-x-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        >
          <MarqueeModules />
        </div>
        <div
          className="relative w-full overflow-x-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        >
          <MarqueeModule />
        </div>
      </section>
      {/* ── Final CTA ────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-hero opacity-[0.04]" />
        <div className="blob w-125 h-125 bg-primary/10 -bottom-60 -right-60 animate-pulse-glow" />
        <div className="blob w-100 h-100 bg-accent/10 -top-60 -left-60 animate-pulse-glow" />

        <div className="container relative mx-auto px-4 md:px-6 text-center">
          <div className="glass rounded-3xl p-10 md:p-16 max-w-3xl mx-auto glow-primary">
            <GraduationCap className="h-12 w-12 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Learning <span className="text-gradient">Together?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Join thousands of students and lecturers already using ScholarSync to transform their
              academic experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all text-base px-8 h-12"
                >
                  Create Your Account
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="transition-all hover:-translate-y-0.5 text-base px-8 h-12"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t py-10 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-primary">Scholar</span>
                <span className="text-accent">Sync</span>
              </span>
            </Link>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">
                Testimonials
              </a>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              &copy; 2026 ScholarSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
