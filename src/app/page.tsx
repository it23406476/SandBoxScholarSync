import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  MessageSquare,
  Award,
  Users,
  ChevronRight,
  GraduationCap,
  Zap,
  Shield,
} from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle'; // Adjust path if needed
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: MessageSquare,
    title: 'Module-Based Q&A',
    desc: 'Ask and answer questions organized by academic modules',
  },
  {
    icon: Award,
    title: 'Reputation & Badges',
    desc: 'Earn recognition for your contributions to the community',
  },
  { icon: Users, title: 'Lecturer Verification', desc: 'Get verified answers from your lecturers' },
  {
    icon: BookOpen,
    title: 'Knowledge Sharing',
    desc: 'Share resources, tips, and study materials',
  },
  { icon: Zap, title: 'Smart Suggestions', desc: 'AI-powered similar question recommendations' },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Tailored experience for students and lecturers',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
          <h1 className="text-xl font-bold">
            <span className="text-primary">Scholar</span>
            <span className="text-accent">Sync</span>
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground flex-1 flex flex-col justify-center py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-sm mb-6 animate-fade-in">
              <GraduationCap className="h-4 w-4" />
              Academic Knowledge Platform
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up">
              Where Students & Lecturers Connect Through Knowledge
            </h2>
            <p
              className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              ScholarSync is a module-based academic Q&A platform designed for universities. Ask
              questions, share knowledge, and earn reputation — all in one place.
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
                >
                  Join ScholarSync
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-primary-foreground hover:bg-primary-foreground/10 w-full border-white/20"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Everything You Need to Excel</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for academic collaboration, ScholarSync brings together all the tools students
              and lecturers need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card
                key={f.title}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-lg font-bold">
            <span className="text-primary">Scholar</span>
            <span className="text-accent">Sync</span>
          </h1>
          <p className="text-sm text-muted-foreground">© 2026 ScholarSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
